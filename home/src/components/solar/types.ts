import type * as THREE from "three";

// Simplified Keplerian elements at the J2000.0 epoch plus linear rates per
// Julian century. Values follow Standish (1992); good to arcminutes for the
// 1800-2050 range — far more than enough for visualization.
export interface KeplerElements {
  // Semi-major axis (AU) and its rate (AU / cty)
  a: number;
  aDot: number;
  // Eccentricity and its rate (/cty)
  e: number;
  eDot: number;
  // Inclination to ecliptic (deg) and rate (deg/cty)
  i: number;
  iDot: number;
  // Mean longitude at epoch (deg) and rate (deg/cty)
  L: number;
  LDot: number;
  // Longitude of perihelion (deg) and rate (deg/cty)
  varpi: number;
  varpiDot: number;
  // Longitude of ascending node (deg) and rate (deg/cty)
  Omega: number;
  OmegaDot: number;
}

export interface PlanetFacts {
  radiusKm: number; // equatorial radius
  massKg: number;
  rotationHours: number; // sidereal rotation, negative = retrograde
  orbitalDays: number; // sidereal period
  tiltDeg: number;
  description: string;
}

export interface MoonFacts {
  radiusKm: number;
  distanceKm: number; // mean distance from parent
  periodDays: number; // orbital period
  description: string;
}

export interface MoonDef {
  name: string;
  color: string;
  facts: MoonFacts;
  // Display parameters — not physical. Tuned for visibility.
  displayRadius: number;
  displayDistance: number;
  displayPeriodSec: number; // seconds per revolution at 1 day/s speed
}

export interface PlanetDef {
  name: string;
  color: string;
  elements: KeplerElements;
  facts: PlanetFacts;
  // Display parameters — planet render radius is exaggerated.
  displayRadius: number;
  hasRings?: boolean;
  moons: MoonDef[];
}

// Runtime scene objects, not data.
export interface BodyHandle {
  name: string;
  kind: "planet" | "moon" | "sun";
  mesh: THREE.Object3D;
  parent?: string;
}
