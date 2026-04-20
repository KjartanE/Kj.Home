"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { MandelbrotControls, MAX_ITER, ITER_SCALE, ITER_FLOOR } from "./MandelbrotControls";
import { ZoomIndicator } from "./ZoomIndicator";
import { NavigationControls } from "./NavigationControls";
import {
  type DD,
  ddToQS,
  computeReferenceOrbitQS,
  buildBLA,
  BLA_TEX_W,
  BLA_TEX_H,
  BLA_MAX_LEVELS,
  BLA_ROW_OFFSETS,
  ORBIT_TEX_W,
  ORBIT_TEX_H
} from "./computeOrbit";

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
  // Debug: when > 0.5, output per-branch diagnostic colours instead of the
  // normal Mandelbrot palette. Toggle from controls with the D key.
  uniform float debugMode;

  // Orbit data
  uniform sampler2D orbitRe;
  uniform sampler2D orbitIm;
  uniform vec2  orbitCenter0;
  uniform vec2  orbitCenter1;
  uniform vec2  orbitCenter2;
  uniform vec2  orbitCenter3;
  uniform float orbitLength;

  // BLA tables: DS coefficients — blaAB carries the hi float32 limb of
  // (A.re, A.im, B.re, B.im), blaABLo carries the lo limb. rSq lives in
  // blaR.r. Per-level row offsets / entry counts come from uniforms.
  uniform sampler2D blaAB;
  uniform sampler2D blaABLo;
  uniform sampler2D blaR;
  uniform float     blaRowOffsets[8];
  uniform float     blaNumEntries[8];

  // Pauldelbrot glitch tolerance, squared. γ² = 1e-6 → γ = 1e-3.
  const float GLITCH_TOL_SQ = 1e-6;
  // Orbit / BLA texture geometry — constants inlined from JS via template
  // literal so they stay in sync with the DataTexture dimensions.
  const float ORBIT_TEX_W = ${ORBIT_TEX_W}.0;
  const float ORBIT_TEX_H = ${ORBIT_TEX_H}.0;
  const float BLA_TEX_W = ${BLA_TEX_W}.0;
  const float BLA_TEX_H = ${BLA_TEX_H}.0;
  const int   BLA_MAX_LEVELS = 8;
  // Shader-level ceiling for dynamic loops. Matches MAX_ITER.
  const float MAX_ITER_CONST = ${MAX_ITER}.0;
  // Outer loop cap for the BLA-driven iteration: in the worst case (all
  // BLAs reject) it degenerates to one step per pass, so we still need
  // the full MAX_ITER ceiling. In practice average step size is large.
  const int   BLA_OUTER_MAX = ${MAX_ITER};

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

  // ── DS multiply (for ndc x scale) ──────────────────────────────────
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

  // BLA entry lookup. rowOffset is the starting row for this level (from
  // uniform blaRowOffsets), e is the entry index within the level.
  vec2 blaTexCoord(float rowOffset, float e) {
    float col = mod(e, BLA_TEX_W);
    float row = rowOffset + floor(e / BLA_TEX_W);
    return vec2((col + 0.5) / BLA_TEX_W, (row + 0.5) / BLA_TEX_H);
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

    // ── Phase 1: BLA-accelerated perturbation ────────────────────────
    // Outer loop runs over "actions" (either a BLA skip of 2^level steps
    // or a single perturbation step), not raw iterations. At each action
    // we first test escape / glitch at (Z_iter, ε_iter), then look for
    // the highest-level BLA whose validity radius admits the current ε.
    // If BLA's post-skip state would be past escape, we revert and fall
    // back to a single step so the escape iteration count stays accurate.
    vec4 eps_re = vec4(0.0);
    vec4 eps_im = vec4(0.0);
    float iter = 0.0;
    float lastIter = perturbIterations;
    float esc_re = 0.0;
    float esc_im = 0.0;
    bool escaped = false;
    bool glitched = false;
    // Debug counters: shader-side view of which paths the pixel took.
    bool tookDirectQS = false;
    float blaIters = 0.0;

    for (int k = 0; k < BLA_OUTER_MAX; k++) {
      if (iter >= perturbIterations) { lastIter = iter; break; }

      vec2 tc = orbitTexCoord(iter);
      vec4 Zn_re = texture2D(orbitRe, tc);
      vec4 Zn_im = texture2D(orbitIm, tc);

      float eps_re_f = eps_re.x + eps_re.y;
      float eps_im_f = eps_im.x + eps_im.y;
      float eps_r2 = eps_re_f * eps_re_f + eps_im_f * eps_im_f;

      float full_re = Zn_re.x + Zn_re.y + eps_re.x + eps_re.y;
      float full_im = Zn_im.x + Zn_im.y + eps_im.x + eps_im.y;
      float r2 = full_re * full_re + full_im * full_im;

      if (r2 > 4.0) {
        lastIter = iter;
        esc_re = full_re;
        esc_im = full_im;
        escaped = true;
        break;
      }

      if (iter > 4.0 && r2 < GLITCH_TOL_SQ * eps_r2) {
        lastIter = iter;
        glitched = true;
        break;
      }

      // |δc|² at this pixel — constant across the level search, so
      // compute once. Used by the BLA validity check below to account for
      // the B·δc contribution, not just A·ε.
      float dc_re_f = dcr.x + dcr.y;
      float dc_im_f = dci.x + dci.y;
      float dc_r2  = dc_re_f * dc_re_f + dc_im_f * dc_im_f;
      float eps_mag = sqrt(eps_r2);
      float dc_mag  = sqrt(dc_r2);

      // BLA search: highest level whose alignment, range, entry existence,
      // and validity radius all admit the current state. Validity now
      // enforces (|ε| + (|B|/|A|)·|δc|)² < rSq — AM/triangle bound on the
      // magnitude of the linear skip result.
      float chosenStep = 0.0;
      vec4  chosenABHi = vec4(0.0);
      vec4  chosenABLo = vec4(0.0);
      for (int l = BLA_MAX_LEVELS - 1; l >= 1; l--) {
        float stepL = exp2(float(l));
        if (mod(iter, stepL) > 0.5) continue;
        if (iter + stepL > perturbIterations + 0.5) continue;
        float e = iter / stepL;
        if (e >= blaNumEntries[l]) continue;

        vec2 tcl = blaTexCoord(blaRowOffsets[l], e);
        vec4 ABhi = texture2D(blaAB, tcl);
        float rSq = texture2D(blaR, tcl).r;
        if (rSq <= 0.0) continue;

        float A_hi_sq = ABhi.x * ABhi.x + ABhi.y * ABhi.y;
        float B_hi_sq = ABhi.z * ABhi.z + ABhi.w * ABhi.w;
        float ba_mag = (A_hi_sq > 0.0) ? sqrt(B_hi_sq / A_hi_sq) : 1e30;
        float effective = eps_mag + ba_mag * dc_mag;

        if (effective * effective < rSq) {
          chosenStep = stepL;
          chosenABHi = ABhi;
          chosenABLo = texture2D(blaABLo, tcl);
          break;
        }
      }

      if (chosenStep > 0.5) {
        // Speculative BLA skip: ε ← A·ε + B·δc. Coefficients are stored as
        // DS pairs (hi, lo); promote to QS with zeros in the upper limbs
        // so the existing qs_mul gives full DS-precision arithmetic.
        vec4 eps_re_save = eps_re;
        vec4 eps_im_save = eps_im;

        vec4 A_re = vec4(chosenABHi.x, chosenABLo.x, 0.0, 0.0);
        vec4 A_im = vec4(chosenABHi.y, chosenABLo.y, 0.0, 0.0);
        vec4 B_re = vec4(chosenABHi.z, chosenABLo.z, 0.0, 0.0);
        vec4 B_im = vec4(chosenABHi.w, chosenABLo.w, 0.0, 0.0);

        vec4 Ae_re = qs_sub(qs_mul(A_re, eps_re), qs_mul(A_im, eps_im));
        vec4 Ae_im = qs_add(qs_mul(A_re, eps_im), qs_mul(A_im, eps_re));
        vec4 Bdc_re = qs_sub(qs_mul(B_re, dcr), qs_mul(B_im, dci));
        vec4 Bdc_im = qs_add(qs_mul(B_re, dci), qs_mul(B_im, dcr));
        eps_re = qs_add(Ae_re, Bdc_re);
        eps_im = qs_add(Ae_im, Bdc_im);

        float post_iter = iter + chosenStep;
        vec2 post_tc = orbitTexCoord(post_iter);
        vec4 pZ_re = texture2D(orbitRe, post_tc);
        vec4 pZ_im = texture2D(orbitIm, post_tc);
        float pf_re = pZ_re.x + pZ_re.y + eps_re.x + eps_re.y;
        float pf_im = pZ_im.x + pZ_im.y + eps_im.x + eps_im.y;
        float pr2 = pf_re * pf_re + pf_im * pf_im;

        if (pr2 > 4.0) {
          // Escape happened somewhere inside the skip — revert and let
          // the single-step path below advance one iteration at a time
          // until the escape lands on a specific iter for smooth coloring.
          eps_re = eps_re_save;
          eps_im = eps_im_save;
        } else {
          blaIters += chosenStep;
          iter = post_iter;
          continue;
        }
      }

      // Single-step perturbation: ε_{n+1} = (2·Z_n + ε_n)·ε_n + δc.
      vec4 a_re = qs_add(Zn_re + Zn_re, eps_re);
      vec4 a_im = qs_add(Zn_im + Zn_im, eps_im);
      vec4 new_re = qs_add(qs_sub(qs_mul(a_re, eps_re), qs_mul(a_im, eps_im)), dcr);
      vec4 new_im = qs_add(qs_add(qs_mul(a_re, eps_im), qs_mul(a_im, eps_re)), dci);
      eps_re = new_re;
      eps_im = new_im;
      iter += 1.0;
    }

    // ── Phase 2: Direct QS fallback for glitched or orbit-exhausted pixels ──
    // On entry, (Z_{lastIter}, ε_{lastIter}) are a consistent pair, so we
    // reconstruct z = Z + ε and continue the plain z←z²+c iteration at
    // full QS precision. Slower per-step but correct where perturbation
    // broke down.
    if (!escaped && lastIter < dynamicIterations) {
      tookDirectQS = true;
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

    if (debugMode > 0.5) {
      // Per-branch diagnostic palette:
      //   RED      = hit iteration ceiling (treated as interior)
      //   GREEN    = escaped via pure perturbation + BLA (clean path)
      //   BLUE     = escaped via direct-QS fallback (glitch recovery)
      //   MAGENTA  = glitched and never escaped even in fallback
      //   CYAN     = BLA-dominated clean escape (most iters came from skips)
      // Value is modulated by iter fraction so depth is visible.
      float depth = clamp(lastIter / max(dynamicIterations, 1.0), 0.0, 1.0);
      float v = 0.25 + 0.75 * depth;
      vec3 dbg;
      if (!escaped && glitched) {
        dbg = vec3(1.0, 0.0, 1.0) * v; // magenta: glitched, no resolution
      } else if (!escaped) {
        dbg = vec3(1.0, 0.0, 0.0) * v; // red: iter ceiling
      } else if (tookDirectQS) {
        dbg = vec3(0.0, 0.0, 1.0) * v; // blue: direct-QS fallback resolved
      } else {
        // Clean escape. If BLA did most of the work, shift toward cyan.
        float blaFraction = clamp(blaIters / max(lastIter, 1.0), 0.0, 1.0);
        dbg = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 1.0), blaFraction) * v;
      }
      gl_FragColor = vec4(dbg, 1.0);
      return;
    }

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
  const [isComputingOrbit, setIsComputingOrbit] = useState(false);
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

    // BLA textures: (A.re, A.im, B.re, B.im) as a DS pair in blaAB (high
    // limbs) and blaABLo (low limbs) for ~14 digits of coefficient
    // precision, then rSq in blaR's .r channel. 4096 × 34 × RGBA32F ≈
    // 2.1 MB each → ~6.3 MB total.
    const blaAB = new Float32Array(BLA_TEX_W * BLA_TEX_H * 4);
    const blaABLo = new Float32Array(BLA_TEX_W * BLA_TEX_H * 4);
    const blaR = new Float32Array(BLA_TEX_W * BLA_TEX_H * 4);
    const blaNumEntries = new Array<number>(BLA_MAX_LEVELS).fill(0);

    const blaABTex = new THREE.DataTexture(blaAB, BLA_TEX_W, BLA_TEX_H, THREE.RGBAFormat, THREE.FloatType);
    blaABTex.minFilter = THREE.NearestFilter;
    blaABTex.magFilter = THREE.NearestFilter;
    blaABTex.needsUpdate = true;

    const blaABLoTex = new THREE.DataTexture(blaABLo, BLA_TEX_W, BLA_TEX_H, THREE.RGBAFormat, THREE.FloatType);
    blaABLoTex.minFilter = THREE.NearestFilter;
    blaABLoTex.magFilter = THREE.NearestFilter;
    blaABLoTex.needsUpdate = true;

    const blaRTex = new THREE.DataTexture(blaR, BLA_TEX_W, BLA_TEX_H, THREE.RGBAFormat, THREE.FloatType);
    blaRTex.minFilter = THREE.NearestFilter;
    blaRTex.magFilter = THREE.NearestFilter;
    blaRTex.needsUpdate = true;

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
        debugMode: { value: 0.0 },
        isDarkTheme: { value: theme.resolvedTheme === "dark" ? 1.0 : 0.0 },
        backgroundColor: { value: new THREE.Color(theme.resolvedTheme === "dark" ? "#09090b" : "#ffffff") },
        orbitRe: { value: orbitReTex },
        orbitIm: { value: orbitImTex },
        orbitCenter0: { value: new THREE.Vector2(0, 0) },
        orbitCenter1: { value: new THREE.Vector2(0, 0) },
        orbitCenter2: { value: new THREE.Vector2(0, 0) },
        orbitCenter3: { value: new THREE.Vector2(0, 0) },
        orbitLength: { value: MAX_ITER },
        blaAB: { value: blaABTex },
        blaABLo: { value: blaABLoTex },
        blaR: { value: blaRTex },
        blaRowOffsets: { value: new Float32Array(BLA_ROW_OFFSETS) },
        blaNumEntries: { value: new Float32Array(BLA_MAX_LEVELS) }
      },
      vertexShader: mandelbrotVertexShader,
      fragmentShader: mandelbrotFragmentShader
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const controls = new MandelbrotControls(material, renderer.domElement, aspect);
    controlsRef.current = controls;
    controls.onZoomChange = (zoom) => setCurrentZoom(zoom);

    // Orbit update callback — computes the reference orbit, then the BLA
    // table derived from it. Both go through pre-allocated buffers so this
    // can be called repeatedly (pan / zoom transitions) without GC churn.
    const updateOrbit = (cx: DD, cy: DD, targetIter: number) => {
      const length = computeReferenceOrbitQS(cx, cy, targetIter, orbitReData, orbitImData);
      orbitReTex.needsUpdate = true;
      orbitImTex.needsUpdate = true;

      buildBLA(length, orbitReData, orbitImData, { ab: blaAB, abLo: blaABLo, r: blaR, numEntries: blaNumEntries });
      blaABTex.needsUpdate = true;
      blaABLoTex.needsUpdate = true;
      blaRTex.needsUpdate = true;

      const numEntriesUniform = material.uniforms.blaNumEntries.value as Float32Array;
      for (let i = 0; i < BLA_MAX_LEVELS; i++) numEntriesUniform[i] = blaNumEntries[i];

      const cxQS = ddToQS(cx);
      const cyQS = ddToQS(cy);
      material.uniforms.orbitCenter0.value.set(cxQS[0], cyQS[0]);
      material.uniforms.orbitCenter1.value.set(cxQS[1], cyQS[1]);
      material.uniforms.orbitCenter2.value.set(cxQS[2], cyQS[2]);
      material.uniforms.orbitCenter3.value.set(cxQS[3], cyQS[3]);
      material.uniforms.orbitLength.value = length;
    };

    // ── Pull-based render loop ─────────────────────────────────────────
    // We keep the canvas stale until someone explicitly requests a frame.
    // Coalesces multiple requests per tick into a single renderer.render().
    // Idle tab settles to 0% GPU instead of burning 60 Hz on a static image.
    const BASELINE_DPR = Math.min(window.devicePixelRatio, 2);
    const SUPERSAMPLE_DPR = Math.min(BASELINE_DPR * 2, 4);
    const IDLE_SUPERSAMPLE_MS = 300;

    let needsRender = false;
    let rafScheduled = false;
    let isSupersampled = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const applyPixelRatio = (ratio: number) => {
      renderer.setPixelRatio(ratio);
      // Pass `false` so three.js only resizes the drawing buffer, not the
      // canvas CSS box — we manage that ourselves via innerWidth/innerHeight.
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };

    const requestRender = () => {
      needsRender = true;
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        rafScheduled = false;
        if (!needsRender) return;
        needsRender = false;
        renderer.render(scene, camera);
      });
    };

    // Any real activity cancels supersample, resets the idle timer, and
    // queues a render. Smooth-zoom ticks funnel through here via the
    // controls' onRenderRequest hook.
    const markActive = () => {
      if (isSupersampled) {
        isSupersampled = false;
        applyPixelRatio(BASELINE_DPR);
      }
      if (idleTimer !== null) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // Only supersample once idle animation is fully settled. The
        // controls.animating check catches mid-transition pauses.
        if (controls.animating) return;
        isSupersampled = true;
        applyPixelRatio(SUPERSAMPLE_DPR);
        requestRender();
      }, IDLE_SUPERSAMPLE_MS);
      requestRender();
    };

    controls.onRenderRequest = markActive;
    controls.onDebugToggle = () => {
      const u = material.uniforms.debugMode;
      u.value = u.value > 0.5 ? 0.0 : 1.0;
      markActive();
    };

    // Wrap the synchronous orbit+BLA compute so the loading overlay has a
    // chance to paint before we block the main thread. Two RAFs: the first
    // lets React flush the isComputingOrbit=true state; the second runs
    // after the browser has painted it. Multiple requests during the wait
    // coalesce via latestParams — only the most-recent (cx, cy, targetIter)
    // actually runs.
    //
    // Below this iteration count the compute is fast enough (~tens of ms)
    // that the overlay would just flicker in and out — skip it entirely.
    const LOADING_OVERLAY_ITER_GATE = 12000;
    let schedulePending = false;
    let latestParams: { cx: DD; cy: DD; targetIter: number } | null = null;

    const runPendingCompute = () => {
      const params = latestParams;
      latestParams = null;
      schedulePending = false;
      if (params) {
        updateOrbit(params.cx, params.cy, params.targetIter);
        markActive();
      }
    };

    const scheduleOrbitCompute = (cx: DD, cy: DD, targetIter: number) => {
      latestParams = { cx, cy, targetIter };
      if (schedulePending) return;
      schedulePending = true;

      if (targetIter < LOADING_OVERLAY_ITER_GATE) {
        runPendingCompute();
        return;
      }

      setIsComputingOrbit(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          runPendingCompute();
          setIsComputingOrbit(false);
        });
      });
    };

    controls.onOrbitUpdate = scheduleOrbitCompute;
    controls.init();

    // Compute initial orbit at origin (through the scheduler so the overlay
    // shows if the first compute is slow on cold cache).
    controls.triggerOrbitUpdate();
    markActive();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newAspect = width / height;
      camera.left = -1;
      camera.right = 1;
      camera.top = 1 / newAspect;
      camera.bottom = -1 / newAspect;
      camera.updateProjectionMatrix();
      // Reset to baseline ratio on resize — the supersample pass will
      // re-fire from markActive() after the idle window.
      isSupersampled = false;
      applyPixelRatio(BASELINE_DPR);
      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(2, 2 / newAspect);
      material.uniforms.aspect.value = newAspect;
      markActive();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (idleTimer !== null) clearTimeout(idleTimer);
      controls.cleanup();
      geometry.dispose();
      material.dispose();
      orbitReTex.dispose();
      orbitImTex.dispose();
      blaABTex.dispose();
      blaABLoTex.dispose();
      blaRTex.dispose();
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
      {isComputingOrbit && (
        <div className="fixed left-4 top-4 flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Computing reference orbit…
        </div>
      )}
    </>
  );
}
