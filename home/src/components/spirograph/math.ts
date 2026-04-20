import type { Arm, SpirographParams } from "./types";

export const TAU = Math.PI * 2;

export interface Point {
  x: number;
  y: number;
  t: number;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Symmetric sigmoid easing — y = x^n / (x^n + (1-x)^n). Matches the
// canvas-sketch "slowInOut" shape used in the original sketch.
export function slowInOut(x: number, n = 1.5): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const xn = Math.pow(x, n);
  return xn / (xn + Math.pow(1 - x, n));
}

export function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  return `rgb(${Math.round(lerp(r1, r2, t))}, ${Math.round(lerp(g1, g2, t))}, ${Math.round(lerp(b1, b2, t))})`;
}

export function getActiveArms(p: SpirographParams): Arm[] {
  const arms: Arm[] = [
    { radius: p.arm1Radius, speed: p.arm1Speed, phase: p.arm1Phase },
    { radius: p.arm2Radius, speed: p.arm2Speed, phase: p.arm2Phase }
  ];
  if (p.arm3Enabled) arms.push({ radius: p.arm3Radius, speed: p.arm3Speed, phase: p.arm3Phase });
  if (p.arm4Enabled) arms.push({ radius: p.arm4Radius, speed: p.arm4Speed, phase: p.arm4Phase });
  return arms;
}

export function calculatePoints(
  p: SpirographParams,
  animatedPhase = 0,
  animatedOffset = 0,
  animatedScale = 0
): Point[] {
  const totalRotations = p.rotations;
  const pointsPerRotation = 1000;
  const totalPoints = totalRotations * pointsPerRotation;

  const usePhaseOffset = p.phaseOffset + animatedPhase;
  const useRadialOffset = p.radialOffset + animatedOffset;
  const useScaleOffset = p.scaleOffset + animatedScale;

  const arms = getActiveArms(p);
  const pts: Point[] = new Array(totalPoints + 1);

  for (let i = 0; i <= totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * totalRotations * TAU;
    const rotationNumber = t * totalRotations;

    const radialDrift = useRadialOffset * rotationNumber;
    const phaseDrift = ((usePhaseOffset * Math.PI) / 180) * rotationNumber;
    const scaleDrift = 1 + useScaleOffset * rotationNumber;

    let x = 0;
    let y = 0;
    for (let j = 0; j < arms.length; j++) {
      const arm = arms[j];
      const armAngle = angle * arm.speed + arm.phase + phaseDrift;
      const armRadius = arm.radius * scaleDrift;
      x += armRadius * Math.cos(armAngle);
      y += armRadius * Math.sin(armAngle);
    }

    const currentAngle = Math.atan2(y, x);
    x += radialDrift * Math.cos(currentAngle);
    y += radialDrift * Math.sin(currentAngle);

    pts[i] = { x, y, t };
  }
  return pts;
}

export interface BBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function computeBBox(pts: Point[]): BBox {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX)) return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
  return { minX, maxX, minY, maxY };
}

// Euclid GCD on non-negative integers. Used to reduce arm-speed ratios.
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}
