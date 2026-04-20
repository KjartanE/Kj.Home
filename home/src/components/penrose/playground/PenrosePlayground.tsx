"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildKaleidoscopePenrose } from "../lib/buildKaleidoscopePenrose";
import { createKaleidoscopeMaterial } from "../shaders/kaleidoscopeMaterial";
import { Controls, type KaleidoscopeParams } from "./Controls";

const PHI = (1 + Math.sqrt(5)) / 2;
const MAX_LAYERS = 10;

const DEFAULT_PARAMS: KaleidoscopeParams = {
  layerCount: 5,
  rotationSpeed: 0.05,
  hueSpread: 0.65,
  baseHue: 0.55,
  saturation: 0.85,
  lightness: 0.55,
  deflation: 5,
  paused: false
};

// Golden-ratio harmonic rotation per layer; signs alternate so layers
// counter-rotate against each other. Layer 0 is stationary so the overall
// composition has an anchor.
function rotationFactor(i: number): number {
  if (i === 0) return 0;
  const sign = i % 2 === 0 ? 1 : -1;
  return sign * Math.pow(PHI, (i - 1) / 2);
}

function hueForLayer(i: number, layerCount: number, baseHue: number, hueSpread: number): number {
  if (layerCount <= 1) return baseHue;
  const t = i / (layerCount - 1) - 0.5;
  return (((baseHue + t * hueSpread) % 1) + 1) % 1;
}

const PenrosePlayground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useState<KaleidoscopeParams>(DEFAULT_PARAMS);
  const [pulseKey, setPulseKey] = useState(0);

  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const onChange = useCallback(<K extends keyof KaleidoscopeParams>(key: K, value: KaleidoscopeParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setPulseKey((k) => k + 1);
  }, []);

  // Build geometry once per deflation change.
  const { geometry, maxRadius } = useMemo(() => buildKaleidoscopePenrose(params.deflation), [params.deflation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);
    const fit = (maxRadius * 1.25) / Math.tan(((60 / 2) * Math.PI) / 180);
    camera.position.set(0, 0, fit);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const distanceScale = 1.0 / Math.max(width, height);

    // Build up to MAX_LAYERS meshes all sharing the geometry; swap visibility
    // when layerCount changes so we never rebuild meshes during param updates.
    const layers: { mesh: THREE.LineSegments; material: THREE.ShaderMaterial }[] = [];
    for (let i = 0; i < MAX_LAYERS; i++) {
      const material = createKaleidoscopeMaterial(new THREE.Color(), distanceScale, 1.0);
      const mesh = new THREE.LineSegments(geometry, material);
      mesh.visible = false;
      scene.add(mesh);
      layers.push({ mesh, material });
    }

    const applyParams = () => {
      const p = paramsRef.current;
      for (let i = 0; i < MAX_LAYERS; i++) {
        const active = i < p.layerCount;
        layers[i].mesh.visible = active;
        if (active) {
          const hue = hueForLayer(i, p.layerCount, p.baseHue, p.hueSpread);
          layers[i].material.uniforms.layerColor.value.setHSL(hue, p.saturation, p.lightness);
          // Dim outer layers slightly so center layer reads as the "anchor".
          const alpha = 1.0 - (i / MAX_LAYERS) * 0.35;
          layers[i].material.uniforms.layerAlpha.value = alpha;
        }
      }
    };
    applyParams();

    const clock = new THREE.Clock();

    // Raycast clicks onto the z=0 plane and fire a pulse on all materials.
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    const ndc = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return;
      const t = clock.getElapsedTime();
      for (const { material } of layers) {
        material.uniforms.pulse.value.set(hit.x, hit.y, t);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const ds = 1.0 / Math.max(w, h);
      for (const { material } of layers) {
        material.uniforms.distanceScale.value = ds;
      }
    };
    window.addEventListener("resize", onResize);

    let lastTime = clock.getElapsedTime();
    const rotations = new Array(MAX_LAYERS).fill(0);
    let rafId = 0;

    const tick = () => {
      const now = clock.getElapsedTime();
      const dt = now - lastTime;
      lastTime = now;

      const p = paramsRef.current;
      const activeCount = p.layerCount;
      if (!p.paused) {
        for (let i = 0; i < activeCount; i++) {
          rotations[i] += dt * p.rotationSpeed * rotationFactor(i);
          layers[i].mesh.rotation.z = rotations[i];
        }
      }

      applyParams();
      for (const { material } of layers) {
        material.uniforms.time.value = now;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      for (const { material } of layers) {
        material.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [geometry, maxRadius, pulseKey]);

  // Dispose the shared geometry on unmount / rebuild.
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full cursor-crosshair" />
      <Controls params={params} onChange={onChange} onReset={onReset} />
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-lg border border-border/40 bg-background/60 px-3 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-md">
        click · pulse ripple
      </div>
    </div>
  );
};

export default PenrosePlayground;
