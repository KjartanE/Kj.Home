import type { KeplerElements } from "./types";

// J2000.0 epoch = 2000 Jan 1.5 TT = Julian Date 2451545.0
const J2000 = 2451545.0;
const DEG = Math.PI / 180;

// Convert a JS Date (UTC) to Julian Date. Close enough for planet visualization.
export function dateToJD(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// Julian centuries past J2000.
export function julianCenturies(jd: number): number {
  return (jd - J2000) / 36525;
}

// Solve Kepler's equation M = E - e*sin(E) for E (radians).
function solveKepler(M: number, e: number): number {
  // Normalize M to [-pi, pi]
  M = ((M + Math.PI) % (2 * Math.PI)) - Math.PI;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// Heliocentric ecliptic coordinates in AU for given elements at Julian date jd.
// Frame: ecliptic J2000, +x toward vernal equinox, +z toward ecliptic north.
export function heliocentricAU(el: KeplerElements, jd: number): { x: number; y: number; z: number; r: number } {
  const T = julianCenturies(jd);
  const a = el.a + el.aDot * T;
  const e = el.e + el.eDot * T;
  const i = (el.i + el.iDot * T) * DEG;
  const L = (el.L + el.LDot * T) * DEG;
  const varpi = (el.varpi + el.varpiDot * T) * DEG;
  const Omega = (el.Omega + el.OmegaDot * T) * DEG;
  const omega = varpi - Omega; // argument of perihelion
  const M = L - varpi;
  const E = solveKepler(M, e);

  // Position in orbital plane
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Rotate to ecliptic frame: Rz(Omega) * Rx(i) * Rz(omega)
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const x = (cosO * cosW - sinO * sinW * cosI) * xOrb + (-cosO * sinW - sinO * cosW * cosI) * yOrb;
  const yEcl = (sinO * cosW + cosO * sinW * cosI) * xOrb + (-sinO * sinW + cosO * cosW * cosI) * yOrb;
  const z = sinW * sinI * xOrb + cosW * sinI * yOrb;

  // We use (x, z_scene=y_ecl, y_scene=z_ecl) so the ecliptic plane is XZ in Three.js.
  return { x, y: z, z: yEcl, r: Math.sqrt(x * x + yEcl * yEcl + z * z) };
}

// Compress AU distance to scene units. Keeps the real direction vector but
// scales radial distance so outer planets stay on screen.
export function auToScene(x: number, y: number, z: number): { x: number; y: number; z: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-9) return { x: 0, y: 0, z: 0 };
  const rScene = 5 + 6 * Math.pow(r, 0.55);
  const k = rScene / r;
  return { x: x * k, y: y * k, z: z * k };
}
