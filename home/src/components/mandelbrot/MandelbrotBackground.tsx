"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { MandelbrotControls, MAX_ITER, ITER_SCALE, ITER_FLOOR } from "./MandelbrotControls";
import { ZoomIndicator } from "./ZoomIndicator";
import { NavigationControls } from "./NavigationControls";
import { type DD, ddToQS, computeReferenceOrbitQS } from "./computeOrbit";

// Orbit texture geometry: 4096 × 16 = 65536 iterations.
// Must match MAX_ITER and the shader's orbitTexCoord() function.
const ORBIT_TEX_W = 4096;
const ORBIT_TEX_H = 16;

const mandelbrotVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Perturbation Mandelbrot Shader with QS arithmetic.
 *
 * Reference orbit Z_n is precomputed on CPU (DD precision) and uploaded as
 * two 4096×16 RGBA float32 textures (real and imaginary QS components),
 * giving up to 65 536 orbit entries. The GPU computes the perturbation
 * ε_{n+1} = (2·Z_n + ε_n)·ε_n + δc, where δc = pixel_c − orbit_center (QS).
 *
 * Glitch handling: Pauldelbrot's criterion (|Z_n+ε_n|² < γ²·|ε_n|²) marks
 * pixels where the perturbation linearization has broken down; those drop
 * out of perturbation into the direct-QS fallback with their last valid
 * (Z_i, ε_i) pair — no multi-reference needed at the precisions we can
 * reach with QS alone.
 */
const mandelbrotFragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 vUv;

  // View center as QS
  uniform vec2  center0;
  uniform vec2  center1;
  uniform vec2  center2;
  uniform vec2  center3;
  uniform float scaleHi;
  uniform float scaleLo;
  uniform float aspect;
  uniform float zoom;
  uniform float maxIterations;
  uniform float iterationScale;
  uniform float iterationFloor;
  uniform float isDarkTheme;
  uniform vec3  backgroundColor;

  // Orbit data
  uniform sampler2D orbitRe;
  uniform sampler2D orbitIm;
  uniform vec2  orbitCenter0;
  uniform vec2  orbitCenter1;
  uniform vec2  orbitCenter2;
  uniform vec2  orbitCenter3;
  uniform float orbitLength;

  // Pauldelbrot glitch tolerance, squared. γ² = 1e-6 → γ = 1e-3.
  const float GLITCH_TOL_SQ = 1e-6;
  // Orbit texture geometry — must match ORBIT_TEX_W/H in MandelbrotBackground.
  const float ORBIT_TEX_W = 4096.0;
  const float ORBIT_TEX_H = 16.0;
  // Shader-level ceiling for dynamic loops. Matches MAX_ITER.
  const float MAX_ITER_CONST = 65536.0;

  // ── Float32 error-free transforms ───────────────────────────────────
  vec2 two_sum(float a, float b) {
    float s = a + b; float v = s - a;
    return vec2(s, (a - (s - v)) + (b - v));
  }

  vec2 vkd_split(float a) {
    float t = 4097.0 * a; float hi = t - (t - a);
    return vec2(hi, a - hi);
  }

  vec2 two_product(float a, float b) {
    float p = a * b; vec2 sa = vkd_split(a); vec2 sb = vkd_split(b);
    return vec2(p, ((sa.x*sb.x - p) + sa.x*sb.y + sa.y*sb.x) + sa.y*sb.y);
  }

  // ── DS multiply (for ndc × scale) ──────────────────────────────────
  vec2 ds_mul(vec2 a, vec2 b) {
    vec2 p = two_product(a.x, b.x);
    return two_sum(p.x, p.y + a.x*b.y + a.y*b.x);
  }

  // ── QS arithmetic ──────────────────────────────────────────────────
  vec4 qs_renorm(float c0, float c1, float c2, float c3) {
    vec2 t;
    t = two_sum(c2, c3); c2 = t.x; c3 = t.y;
    t = two_sum(c1, c2); c1 = t.x; c2 = t.y;
    t = two_sum(c0, c1); c0 = t.x; c1 = t.y;
    t = two_sum(c0, c1); c0 = t.x; c1 = t.y;
    t = two_sum(c1, c2); c1 = t.x; c2 = t.y;
    t = two_sum(c2, c3); c2 = t.x; c3 = t.y;
    return vec4(c0, c1, c2, c3);
  }

  vec4 qs_add(vec4 a, vec4 b) {
    vec2 t0 = two_sum(a.x, b.x);
    vec2 t1 = two_sum(a.y, b.y);
    vec2 t2 = two_sum(a.z, b.z);
    float s3 = a.w + b.w;
    vec2 u1 = two_sum(t1.x, t0.y);
    vec2 u2 = two_sum(t2.x, u1.y + t1.y);
    s3 += u2.y + t2.y;
    return qs_renorm(t0.x, u1.x, u2.x, s3);
  }

  vec4 qs_sub(vec4 a, vec4 b) {
    return qs_add(a, -b);
  }

  vec4 qs_mul(vec4 a, vec4 b) {
    vec2 p0 = two_product(a.x, b.x);
    vec2 p1 = two_product(a.x, b.y);
    vec2 p2 = two_product(a.y, b.x);
    vec2 s1 = two_sum(p1.x, p2.x);
    vec2 s2 = two_sum(s1.x, p0.y);
    float e1 = s2.y + s1.y + p1.y + p2.y;
    vec2 p3 = two_product(a.x, b.z);
    vec2 p4 = two_product(a.y, b.y);
    vec2 p5 = two_product(a.z, b.x);
    vec2 s3 = two_sum(p3.x, p4.x);
    vec2 s4 = two_sum(s3.x, p5.x);
    vec2 s5 = two_sum(s4.x, e1);
    float e2 = s5.y + s4.y + s3.y + p3.y + p4.y + p5.y;
    float c3 = a.x*b.w + a.y*b.z + a.z*b.y + a.w*b.x + e2;
    return qs_renorm(p0.x, s2.x, s5.x, c3);
  }

  vec4 qs_sqr(vec4 a) {
    vec2 p0 = two_product(a.x, a.x);
    vec2 p1 = two_product(a.x, a.y);
    float d1_hi = p1.x + p1.x;
    float d1_lo = p1.y + p1.y;
    vec2 u1 = two_sum(d1_hi, p0.y);
    float e1 = u1.y + d1_lo;
    vec2 p3 = two_product(a.x, a.z);
    vec2 p4 = two_product(a.y, a.y);
    float c2 = p3.x + p3.x + p4.x + e1;
    float e2 = p3.y + p3.y + p4.y;
    float c3 = 2.0*(a.x*a.w + a.y*a.z) + e2;
    return qs_renorm(p0.x, u1.x, c2, c3);
  }

  // Map 1D iteration index → 2D texel center. i is exact up to 2^24, so
  // the 65 536-cap is safely inside highp float's integer range.
  vec2 orbitTexCoord(float i) {
    float col = mod(i, ORBIT_TEX_W);
    float row = floor(i / ORBIT_TEX_W);
    return vec2((col + 0.5) / ORBIT_TEX_W, (row + 0.5) / ORBIT_TEX_H);
  }

  // ── Color ──────────────────────────────────────────────────────────
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec2 ndc = vUv * 2.0 - 1.0;

    // Pixel c = view center + DS offset
    vec2 scale = vec2(scaleHi, scaleLo);
    vec2 off_re = ds_mul(vec2(ndc.x, 0.0), scale);
    vec2 off_im = ds_mul(vec2(ndc.y / aspect, 0.0), scale);

    vec4 cr = qs_add(
      vec4(center0.x, center1.x, center2.x, center3.x),
      vec4(off_re.x, off_re.y, 0.0, 0.0)
    );
    vec4 ci = qs_add(
      vec4(center0.y, center1.y, center2.y, center3.y),
      vec4(off_im.x, off_im.y, 0.0, 0.0)
    );

    // dynamicIterations ≈ iterationScale·log2(zoom) + floor, capped at maxIterations
    float log2Zoom = log2(max(zoom, 1.0));
    float dynamicIterations = clamp(
      iterationScale * log2Zoom + iterationFloor,
      iterationFloor,
      maxIterations
    );
    // Reserve the last orbit slot so Z_{perturbIterations} is always in the
    // texture for the direct-QS fallback handoff.
    float perturbIterations = min(dynamicIterations, max(orbitLength - 1.0, 0.0));

    // Cardioid / period-2 bulb early exit (float32 sufficient)
    float cx = cr.x + cr.y;
    float cy = ci.x + ci.y;
    float q  = (cx - 0.25) * (cx - 0.25) + cy * cy;
    if (q * (q + (cx - 0.25)) < 0.25 * cy * cy) {
      gl_FragColor = vec4(backgroundColor, 1.0); return;
    }
    if ((cx + 1.0) * (cx + 1.0) + cy * cy < 0.0625) {
      gl_FragColor = vec4(backgroundColor, 1.0); return;
    }

    // dc = c - orbitCenter (perturbation offset)
    vec4 ocr = vec4(orbitCenter0.x, orbitCenter1.x, orbitCenter2.x, orbitCenter3.x);
    vec4 oci = vec4(orbitCenter0.y, orbitCenter1.y, orbitCenter2.y, orbitCenter3.y);
    vec4 dcr = qs_sub(cr, ocr);
    vec4 dci = qs_sub(ci, oci);

    // ── Phase 1: Perturbation ─────────────────────────────────────────
    // Invariant entering iteration i: ε holds ε_i (state after i steps).
    // We read Z_i, combine to z_i = Z_i + ε_i, check escape/glitch BEFORE
    // updating ε. On escape/glitch break we keep (Z_i, ε_i) aligned so
    // Phase 2 can reconstruct z = Z_i + ε_i and continue directly.
    vec4 eps_re = vec4(0.0);
    vec4 eps_im = vec4(0.0);
    float lastIter = perturbIterations;
    float esc_re = 0.0;
    float esc_im = 0.0;
    bool escaped = false;
    bool glitched = false;

    for (float i = 0.0; i < MAX_ITER_CONST; i++) {
      if (i >= perturbIterations) { lastIter = i; break; }

      vec2 tc = orbitTexCoord(i);
      vec4 Zn_re = texture2D(orbitRe, tc);
      vec4 Zn_im = texture2D(orbitIm, tc);

      float full_re = Zn_re.x + Zn_re.y + eps_re.x + eps_re.y;
      float full_im = Zn_im.x + Zn_im.y + eps_im.x + eps_im.y;
      float r2 = full_re * full_re + full_im * full_im;

      if (r2 > 4.0) {
        lastIter = i;
        esc_re = full_re;
        esc_im = full_im;
        escaped = true;
        break;
      }

      // Pauldelbrot glitch: |z|² < γ²·|ε|². The guard i > 4 keeps the
      // early iterations (where both sides are near zero) from spuriously
      // triggering; ε is still tiny there, and the criterion is noisy.
      float eps_re_f = eps_re.x + eps_re.y;
      float eps_im_f = eps_im.x + eps_im.y;
      float eps_r2 = eps_re_f * eps_re_f + eps_im_f * eps_im_f;
      if (i > 4.0 && r2 < GLITCH_TOL_SQ * eps_r2) {
        lastIter = i;
        glitched = true;
        break;
      }

      // ε_{n+1} = (2·Z_n + ε_n)·ε_n + δc
      vec4 a_re = qs_add(Zn_re + Zn_re, eps_re);
      vec4 a_im = qs_add(Zn_im + Zn_im, eps_im);
      vec4 new_re = qs_add(qs_sub(qs_mul(a_re, eps_re), qs_mul(a_im, eps_im)), dcr);
      vec4 new_im = qs_add(qs_add(qs_mul(a_re, eps_im), qs_mul(a_im, eps_re)), dci);
      eps_re = new_re;
      eps_im = new_im;
    }

    // ── Phase 2: Direct QS fallback for glitched or orbit-exhausted pixels ──
    // On entry, (Z_{lastIter}, ε_{lastIter}) are a consistent pair, so we
    // reconstruct z = Z + ε and continue the plain z←z²+c iteration at
    // full QS precision. Slower per-step but correct where perturbation
    // broke down.
    if (!escaped && lastIter < dynamicIterations) {
      vec2 tc = orbitTexCoord(lastIter);
      vec4 Zlast_re = texture2D(orbitRe, tc);
      vec4 Zlast_im = texture2D(orbitIm, tc);
      vec4 zr = qs_add(Zlast_re, eps_re);
      vec4 zi = qs_add(Zlast_im, eps_im);

      for (float i = 0.0; i < MAX_ITER_CONST; i++) {
        float iter = lastIter + i;
        if (iter >= dynamicIterations) break;

        vec4 zr2 = qs_sqr(zr);
        vec4 zi2 = qs_sqr(zi);
        vec4 zri = qs_mul(zr, zi);
        zr = qs_add(qs_sub(zr2, zi2), cr);
        zi = qs_add(zri + zri, ci);

        float zr_f = zr.x + zr.y;
        float zi_f = zi.x + zi.y;
        float r2 = zr_f * zr_f + zi_f * zi_f;
        if (r2 > 4.0) {
          lastIter = iter;
          esc_re = zr_f;
          esc_im = zi_f;
          escaped = true;
          break;
        }
      }
    }

    // Suppress "unused var" warning on drivers that elide it; glitched is
    // diagnostic only, reserved for future per-pixel visualization.
    if (glitched) { /* no-op, reserved */ }

    if (!escaped) {
      gl_FragColor = vec4(backgroundColor, 1.0);
    } else {
      float r2 = esc_re * esc_re + esc_im * esc_im;
      float smoothed = lastIter + 1.0 - log(log(r2) * 0.5) / log(2.0);

      float baseHue    = isDarkTheme > 0.5 ? 0.68 : 0.38;
      float saturation = isDarkTheme > 0.5 ? 0.98 : 0.85;
      float value      = isDarkTheme > 0.5
        ? (0.3 + sin(smoothed * 0.05) * 0.1)
        : (0.5 + sin(smoothed * 0.05) * 0.2);
      if (mod(smoothed, 12.0) < 6.0) {
        value *= isDarkTheme > 0.5 ? 0.85 : 0.75; saturation *= 0.99;
      }
      vec3 color = hsv2rgb(vec3(baseHue + smoothed * 0.0005, saturation, value));
      gl_FragColor = vec4(color, 1.0);
    }
  }
`;

export default function MandelbrotBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const controlsRef = useRef<MandelbrotControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-1, 1, 1 / aspect, -1 / aspect, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.cursor = "crosshair";
    container.appendChild(renderer.domElement);

    // Orbit textures: 2D RGBA float32, 4096 × 16 = 65 536 entries. The
    // layout is chosen so iterationBudget() always fits (zoom ~10^25 needs
    // ~25 k entries), the texture stays well under typical MAX_TEXTURE_SIZE
    // limits, and row count is a small power of two for cache friendliness.
    const orbitReData = new Float32Array(MAX_ITER * 4);
    const orbitImData = new Float32Array(MAX_ITER * 4);

    const orbitReTex = new THREE.DataTexture(orbitReData, ORBIT_TEX_W, ORBIT_TEX_H, THREE.RGBAFormat, THREE.FloatType);
    orbitReTex.minFilter = THREE.NearestFilter;
    orbitReTex.magFilter = THREE.NearestFilter;
    orbitReTex.needsUpdate = true;

    const orbitImTex = new THREE.DataTexture(orbitImData, ORBIT_TEX_W, ORBIT_TEX_H, THREE.RGBAFormat, THREE.FloatType);
    orbitImTex.minFilter = THREE.NearestFilter;
    orbitImTex.magFilter = THREE.NearestFilter;
    orbitImTex.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(2, 2 / aspect);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        center0: { value: new THREE.Vector2(0, 0) },
        center1: { value: new THREE.Vector2(0, 0) },
        center2: { value: new THREE.Vector2(0, 0) },
        center3: { value: new THREE.Vector2(0, 0) },
        scaleHi: { value: Math.fround(2.0) },
        scaleLo: { value: 0.0 },
        aspect: { value: aspect },
        zoom: { value: 1.0 },
        maxIterations: { value: MAX_ITER },
        iterationScale: { value: ITER_SCALE },
        iterationFloor: { value: ITER_FLOOR },
        isDarkTheme: { value: theme.resolvedTheme === "dark" ? 1.0 : 0.0 },
        backgroundColor: { value: new THREE.Color(theme.resolvedTheme === "dark" ? "#09090b" : "#ffffff") },
        orbitRe: { value: orbitReTex },
        orbitIm: { value: orbitImTex },
        orbitCenter0: { value: new THREE.Vector2(0, 0) },
        orbitCenter1: { value: new THREE.Vector2(0, 0) },
        orbitCenter2: { value: new THREE.Vector2(0, 0) },
        orbitCenter3: { value: new THREE.Vector2(0, 0) },
        orbitLength: { value: MAX_ITER }
      },
      vertexShader: mandelbrotVertexShader,
      fragmentShader: mandelbrotFragmentShader
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const controls = new MandelbrotControls(material, renderer.domElement, aspect);
    controlsRef.current = controls;
    controls.onZoomChange = (zoom) => setCurrentZoom(zoom);

    // Orbit update callback — writes directly into the pre-allocated
    // texture buffers; computeReferenceOrbitQS returns the valid length.
    const updateOrbit = (cx: DD, cy: DD, targetIter: number) => {
      const length = computeReferenceOrbitQS(cx, cy, targetIter, orbitReData, orbitImData);
      orbitReTex.needsUpdate = true;
      orbitImTex.needsUpdate = true;

      const cxQS = ddToQS(cx);
      const cyQS = ddToQS(cy);
      material.uniforms.orbitCenter0.value.set(cxQS[0], cyQS[0]);
      material.uniforms.orbitCenter1.value.set(cxQS[1], cyQS[1]);
      material.uniforms.orbitCenter2.value.set(cxQS[2], cyQS[2]);
      material.uniforms.orbitCenter3.value.set(cxQS[3], cyQS[3]);
      material.uniforms.orbitLength.value = length;
    };

    controls.onOrbitUpdate = updateOrbit;
    controls.init();

    // Compute initial orbit at origin
    controls.triggerOrbitUpdate();

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newAspect = width / height;
      camera.left = -1;
      camera.right = 1;
      camera.top = 1 / newAspect;
      camera.bottom = -1 / newAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(2, 2 / newAspect);
      material.uniforms.aspect.value = newAspect;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.cleanup();
      geometry.dispose();
      material.dispose();
      orbitReTex.dispose();
      orbitImTex.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [theme.resolvedTheme]);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0" />
      <NavigationControls
        onZoomIn={() => controlsRef.current?.zoomIn()}
        onZoomOut={() => controlsRef.current?.zoomOut()}
        onMove={(direction) => controlsRef.current?.move(direction)}
        onReset={() => controlsRef.current?.reset()}
      />
      <ZoomIndicator zoom={currentZoom} />
    </>
  );
}
