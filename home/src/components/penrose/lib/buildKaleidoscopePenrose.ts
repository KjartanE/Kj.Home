import * as THREE from "three";
import PenroseLSystem from "./PenroseLSystem";

export interface KaleidoscopeGeometry {
  geometry: THREE.BufferGeometry;
  maxRadius: number;
  segmentCount: number;
}

export function buildKaleidoscopePenrose(generations: number): KaleidoscopeGeometry {
  const system = new PenroseLSystem();
  system.simulate(generations);

  const positions: number[] = [];
  const widths: number[] = [];
  const stack: { x: number; y: number; rotation: number }[] = [];

  let x = 0;
  let y = 0;
  let rotation = 0;
  let repeats = 1;
  let maxRadius = 0;

  const drawLength = system.drawLength;
  const theta = system.theta;
  const production = system.production;
  const lineWidth = 0.04;

  for (let i = 0; i < production.length; i++) {
    const step = production[i];
    if (step === "F") {
      const nx = x + drawLength * Math.cos(rotation);
      const ny = y + drawLength * Math.sin(rotation);
      positions.push(x, y, 0, nx, ny, 0);
      widths.push(lineWidth, lineWidth);
      const r = Math.max(Math.hypot(x, y), Math.hypot(nx, ny));
      if (r > maxRadius) maxRadius = r;
      x = nx;
      y = ny;
      repeats = 1;
    } else if (step === "+") {
      rotation += theta * repeats;
      repeats = 1;
    } else if (step === "-") {
      rotation -= theta * repeats;
      repeats = 1;
    } else if (step === "[") {
      stack.push({ x, y, rotation });
    } else if (step === "]") {
      const p = stack.pop();
      if (p) {
        x = p.x;
        y = p.y;
        rotation = p.rotation;
      }
    } else if (step >= "0" && step <= "9") {
      repeats = Number(step);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("width", new THREE.BufferAttribute(new Float32Array(widths), 1));

  return {
    geometry,
    maxRadius,
    segmentCount: positions.length / 6
  };
}
