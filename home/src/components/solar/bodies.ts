import type { PlanetDef } from "./types";

// Keplerian elements at J2000.0 + linear rates per Julian century.
// Source: E.M. Standish, "Keplerian Elements for Approximate Positions of the
// Major Planets" (JPL). Valid 1800–2050 to arcminute accuracy.

export const PLANETS: PlanetDef[] = [
  {
    name: "Mercury",
    color: "#a89888",
    displayRadius: 0.5,
    elements: {
      a: 0.38709927,
      aDot: 0.00000037,
      e: 0.20563593,
      eDot: 0.00001906,
      i: 7.00497902,
      iDot: -0.00594749,
      L: 252.2503235,
      LDot: 149472.67411175,
      varpi: 77.45779628,
      varpiDot: 0.16047689,
      Omega: 48.33076593,
      OmegaDot: -0.12534081
    },
    facts: {
      radiusKm: 2439.7,
      massKg: 3.3011e23,
      rotationHours: 1407.5,
      orbitalDays: 87.969,
      tiltDeg: 0.034,
      description:
        "The smallest planet and closest to the Sun. No atmosphere to speak of — daytime surface reaches 430 °C, night drops to −180 °C."
    },
    moons: []
  },
  {
    name: "Venus",
    color: "#e6c487",
    displayRadius: 0.85,
    elements: {
      a: 0.72333566,
      aDot: 0.0000039,
      e: 0.00677672,
      eDot: -0.00004107,
      i: 3.39467605,
      iDot: -0.0007889,
      L: 181.9790995,
      LDot: 58517.81538729,
      varpi: 131.60246718,
      varpiDot: 0.00268329,
      Omega: 76.67984255,
      OmegaDot: -0.27769418
    },
    facts: {
      radiusKm: 6051.8,
      massKg: 4.8675e24,
      rotationHours: -5832.5,
      orbitalDays: 224.701,
      tiltDeg: 177.36,
      description:
        "Hottest planet in the solar system thanks to a runaway greenhouse CO₂ atmosphere. Spins backwards — one Venusian day is longer than its year."
    },
    moons: []
  },
  {
    name: "Earth",
    color: "#4e7cc8",
    displayRadius: 0.9,
    elements: {
      a: 1.00000261,
      aDot: 0.00000562,
      e: 0.01671123,
      eDot: -0.00004392,
      i: -0.00001531,
      iDot: -0.01294668,
      L: 100.46457166,
      LDot: 35999.37244981,
      varpi: 102.93768193,
      varpiDot: 0.32327364,
      Omega: 0,
      OmegaDot: 0
    },
    facts: {
      radiusKm: 6371,
      massKg: 5.9722e24,
      rotationHours: 23.934,
      orbitalDays: 365.256,
      tiltDeg: 23.44,
      description: "The only known world with liquid surface water and life. 70% ocean, one large natural satellite."
    },
    moons: [
      {
        name: "Moon",
        color: "#c4c0b8",
        displayRadius: 0.2,
        displayDistance: 1.6,
        displayPeriodSec: 8,
        facts: {
          radiusKm: 1737.4,
          distanceKm: 384400,
          periodDays: 27.322,
          description:
            "Tidally locked to Earth, always showing the same hemisphere. Formed from a giant impact ~4.5 Gya."
        }
      }
    ]
  },
  {
    name: "Mars",
    color: "#c1562f",
    displayRadius: 0.6,
    elements: {
      a: 1.52371034,
      aDot: 0.00001847,
      e: 0.0933941,
      eDot: 0.00007882,
      i: 1.84969142,
      iDot: -0.00813131,
      L: -4.55343205,
      LDot: 19140.30268499,
      varpi: -23.94362959,
      varpiDot: 0.44441088,
      Omega: 49.55953891,
      OmegaDot: -0.29257343
    },
    facts: {
      radiusKm: 3389.5,
      massKg: 6.4171e23,
      rotationHours: 24.623,
      orbitalDays: 686.98,
      tiltDeg: 25.19,
      description:
        "Rusty iron-oxide surface, thin CO₂ atmosphere, and the largest volcano in the solar system (Olympus Mons, 22 km tall)."
    },
    moons: [
      {
        name: "Phobos",
        color: "#7a5c48",
        displayRadius: 0.12,
        displayDistance: 1.1,
        displayPeriodSec: 2.5,
        facts: {
          radiusKm: 11.27,
          distanceKm: 9376,
          periodDays: 0.319,
          description:
            "Orbits Mars faster than Mars rotates — rises in the west, sets in the east. Spiraling inward; will crash in ~50 Myr."
        }
      },
      {
        name: "Deimos",
        color: "#6e5440",
        displayRadius: 0.09,
        displayDistance: 1.55,
        displayPeriodSec: 7,
        facts: {
          radiusKm: 6.2,
          distanceKm: 23463,
          periodDays: 1.263,
          description: "Outer Martian moon, smaller and more distant than Phobos. Probably a captured asteroid."
        }
      }
    ]
  },
  {
    name: "Jupiter",
    color: "#d5ac7a",
    displayRadius: 2.2,
    elements: {
      a: 5.202887,
      aDot: -0.00011607,
      e: 0.04838624,
      eDot: -0.00013253,
      i: 1.30439695,
      iDot: -0.00183714,
      L: 34.39644051,
      LDot: 3034.74612775,
      varpi: 14.72847983,
      varpiDot: 0.21252668,
      Omega: 100.47390909,
      OmegaDot: 0.20469106
    },
    facts: {
      radiusKm: 69911,
      massKg: 1.8982e27,
      rotationHours: 9.925,
      orbitalDays: 4332.589,
      tiltDeg: 3.13,
      description:
        "Largest planet — more than twice the mass of all others combined. Gas giant with a centuries-old storm (Great Red Spot) and 95 known moons."
    },
    moons: [
      {
        name: "Io",
        color: "#e8d46a",
        displayRadius: 0.18,
        displayDistance: 2.8,
        displayPeriodSec: 3,
        facts: {
          radiusKm: 1821.6,
          distanceKm: 421700,
          periodDays: 1.769,
          description:
            "Most volcanically active body in the solar system. Tidal heating from Jupiter keeps its interior molten."
        }
      },
      {
        name: "Europa",
        color: "#cab79a",
        displayRadius: 0.17,
        displayDistance: 3.4,
        displayPeriodSec: 5.5,
        facts: {
          radiusKm: 1560.8,
          distanceKm: 671100,
          periodDays: 3.551,
          description:
            "Ice-covered ocean world. A subsurface liquid-water ocean may hold more water than all of Earth's."
        }
      },
      {
        name: "Ganymede",
        color: "#a69880",
        displayRadius: 0.25,
        displayDistance: 4.1,
        displayPeriodSec: 9,
        facts: {
          radiusKm: 2634.1,
          distanceKm: 1070400,
          periodDays: 7.155,
          description:
            "Largest moon in the solar system — bigger than Mercury. The only moon with its own magnetic field."
        }
      },
      {
        name: "Callisto",
        color: "#6e5e48",
        displayRadius: 0.23,
        displayDistance: 4.9,
        displayPeriodSec: 14,
        facts: {
          radiusKm: 2410.3,
          distanceKm: 1882700,
          periodDays: 16.689,
          description: "Most heavily cratered object known. Geologically inactive; its surface is ~4 billion years old."
        }
      }
    ]
  },
  {
    name: "Saturn",
    color: "#e6c891",
    displayRadius: 1.9,
    hasRings: true,
    elements: {
      a: 9.53667594,
      aDot: -0.0012506,
      e: 0.05386179,
      eDot: -0.00050991,
      i: 2.48599187,
      iDot: 0.00193609,
      L: 49.95424423,
      LDot: 1222.49362201,
      varpi: 92.59887831,
      varpiDot: -0.41897216,
      Omega: 113.66242448,
      OmegaDot: -0.28867794
    },
    facts: {
      radiusKm: 58232,
      massKg: 5.6834e26,
      rotationHours: 10.656,
      orbitalDays: 10759.22,
      tiltDeg: 26.73,
      description:
        "Famous for its ring system of water ice and rock. Less dense than water — it would float. 146 known moons."
    },
    moons: [
      {
        name: "Titan",
        color: "#d5a23a",
        displayRadius: 0.22,
        displayDistance: 3.5,
        displayPeriodSec: 10,
        facts: {
          radiusKm: 2574.7,
          distanceKm: 1221870,
          periodDays: 15.945,
          description:
            "Only moon with a thick atmosphere. Has liquid methane lakes and a hydrological cycle — using methane instead of water."
        }
      },
      {
        name: "Rhea",
        color: "#b8b5a8",
        displayRadius: 0.13,
        displayDistance: 4.3,
        displayPeriodSec: 5,
        facts: {
          radiusKm: 763.8,
          distanceKm: 527108,
          periodDays: 4.518,
          description: "Saturn's second-largest moon. An icy body that may have a tenuous ring system of its own."
        }
      }
    ]
  },
  {
    name: "Uranus",
    color: "#9fd8d4",
    displayRadius: 1.3,
    elements: {
      a: 19.18916464,
      aDot: -0.00196176,
      e: 0.04725744,
      eDot: -0.00004397,
      i: 0.77263783,
      iDot: -0.00242939,
      L: 313.23810451,
      LDot: 428.48202785,
      varpi: 170.9542763,
      varpiDot: 0.40805281,
      Omega: 74.01692503,
      OmegaDot: 0.04240589
    },
    facts: {
      radiusKm: 25362,
      massKg: 8.681e25,
      rotationHours: -17.24,
      orbitalDays: 30688.5,
      tiltDeg: 97.77,
      description:
        "Rolls along its orbit on its side — a 98° axial tilt. Methane in its atmosphere gives it a pale cyan color."
    },
    moons: [
      {
        name: "Titania",
        color: "#b0a89a",
        displayRadius: 0.12,
        displayDistance: 2.2,
        displayPeriodSec: 8,
        facts: {
          radiusKm: 788.4,
          distanceKm: 435910,
          periodDays: 8.706,
          description: "Largest Uranian moon. Named after the fairy queen in A Midsummer Night's Dream."
        }
      },
      {
        name: "Oberon",
        color: "#8a7f70",
        displayRadius: 0.12,
        displayDistance: 2.7,
        displayPeriodSec: 12,
        facts: {
          radiusKm: 761.4,
          distanceKm: 583520,
          periodDays: 13.463,
          description: "Second-largest moon of Uranus, scarred by impact craters and possible cryovolcanic features."
        }
      }
    ]
  },
  {
    name: "Neptune",
    color: "#3a6fd8",
    displayRadius: 1.3,
    elements: {
      a: 30.06992276,
      aDot: 0.00026291,
      e: 0.00859048,
      eDot: 0.00005105,
      i: 1.77004347,
      iDot: 0.00035372,
      L: -55.12002969,
      LDot: 218.45945325,
      varpi: 44.96476227,
      varpiDot: -0.32241464,
      Omega: 131.78422574,
      OmegaDot: -0.00508664
    },
    facts: {
      radiusKm: 24622,
      massKg: 1.02413e26,
      rotationHours: 16.11,
      orbitalDays: 60182,
      tiltDeg: 28.32,
      description:
        "Farthest planet from the Sun. Supersonic winds (>2000 km/h) are the fastest in the solar system. Discovered by mathematics before observation."
    },
    moons: [
      {
        name: "Triton",
        color: "#c4b0a0",
        displayRadius: 0.18,
        displayDistance: 2.4,
        displayPeriodSec: 7,
        facts: {
          radiusKm: 1353.4,
          distanceKm: 354759,
          periodDays: -5.877,
          description: "Orbits Neptune backwards — likely a captured Kuiper-belt object. Has active nitrogen geysers."
        }
      }
    ]
  }
];

export const SUN_FACTS = {
  radiusKm: 695700,
  massKg: 1.989e30,
  rotationHours: 609.12, // ~25.4 days at equator
  description:
    "A G-type main-sequence star. Contains 99.86% of the mass in the solar system. Fuses ~600 million tonnes of hydrogen to helium every second."
};
