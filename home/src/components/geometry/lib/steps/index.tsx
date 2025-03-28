import { Geometry } from "../Geometry";
import { StepConfig } from "../SceneSteps";

const scale = 2;

// Utility functions for aligning geometry to polar grid
// These follow the same logic as in PolarGrid.tsx
const getPolarGridRadius = (circleIndex: number, numCircles: number = 4, maxRadius: number = 10) => {
  return (circleIndex / numCircles) * maxRadius;
};

const getPolarGridPoint = (
  circleIndex: number,
  directionIndex: number,
  y: number = 0,
  numCircles: number = 4,
  numDirections: number = 6,
  maxRadius: number = 10
) => {
  const radius = getPolarGridRadius(circleIndex, numCircles, maxRadius);
  const theta = (directionIndex / numDirections) * Math.PI * 2 + Math.PI / 6;
  return {
    x: radius * Math.cos(theta),
    y,
    z: radius * Math.sin(theta)
  };
};

export const GeometrySteps: StepConfig[] = [
  {
    name: "base",
    setupGeometry: (geometry: Geometry) => {
      // Central circle aligned with the first polar grid circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(scale), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });
    }
  },
  {
    name: "Vesica Piscis",
    setupGeometry: (geometry: Geometry) => {
      // Two circles placed at opposite cardinal points on the grid

      geometry.createCircle({ x: 2, y: 0, z: 0 }, getPolarGridRadius(scale), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });
      geometry.createCircle({ x: -2, y: 0, z: 0 }, getPolarGridRadius(scale), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });
    }
  },
  {
    name: "Tripod of Life ~ Triquetra",
    setupGeometry: (geometry: Geometry) => {
      // Three circles placed at three equidistant points on the grid
      const point1 = getPolarGridPoint(1, 1);
      const point2 = getPolarGridPoint(1, 3); // 120 degrees
      const point3 = getPolarGridPoint(1, 5); // 240 degrees

      geometry.createCircle(point1, getPolarGridRadius(scale), { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle(point2, getPolarGridRadius(scale), { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle(point3, getPolarGridRadius(scale), { strokeColor: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Seed of Life",
    setupGeometry: (geometry: Geometry) => {
      // Central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(scale), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // Outer circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(scale * 2), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // Six circles around the center at each cardinal direction
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(2, i);
        geometry.createCircle(point, getPolarGridRadius(scale), { strokeColor: 0xff4400, animationDuration: 3 });
      }
    }
  },
  {
    name: "Lotus of Life",
    setupGeometry: (geometry: Geometry) => {
      // Central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(scale), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // Outer circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(scale * 2), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // 12 circles around the center at each cardinal direction
      for (let i = 0; i < 12; i++) {
        // Pass numDirections=12 to ensure 12 evenly spaced points
        const point = getPolarGridPoint(2, i, 0, 4, 12);
        geometry.createCircle(point, getPolarGridRadius(scale), { strokeColor: 0xff4400, animationDuration: 3 });
      }
    }
  },
  {
    name: "Torus",
    setupGeometry: (geometry: Geometry) => {
      // Outer circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(scale * 2), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // 12 circles around the center at each cardinal direction
      for (let i = 0; i < 48; i++) {
        // Pass numDirections=48 to ensure 48 evenly spaced points
        const point = getPolarGridPoint(2, i, 0, 4, 48);
        geometry.createCircle(point, getPolarGridRadius(scale), { strokeColor: 0xff4400, animationDuration: 3 });
      }
    }
  },
  {
    name: "Flower of Life",
    setupGeometry: (geometry: Geometry) => {
      // Create central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(1), {
        strokeColor: 0xff4400,
        animationDuration: 2
      });

      //outer circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(3), {
        strokeColor: 0xff4400,
        animationDuration: 2
      });

      //outer circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(3.1), {
        strokeColor: 0xff4400,
        animationDuration: 2
      });

      // Create first ring (6 circles)
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(1, i);
        geometry.createCircle(point, getPolarGridRadius(1), { strokeColor: 0xff4400, animationDuration: 2 });
      }

      // Create second ring (6 circles)
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(2, i);
        geometry.createCircle(point, getPolarGridRadius(1), { strokeColor: 0xff4400, animationDuration: 2 });
      }  
    }
  },
  {
    name: "Egg of Life",
    setupGeometry: (geometry: Geometry) => {
      // Create central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(0.5), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // Create the 6 surrounding circles at the first grid circle radius
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(1, i);
        geometry.createCircle(point, getPolarGridRadius(0.5), { strokeColor: 0xff4400, animationDuration: 3 });
      }
    }
  },
  {
    name: "Fruit of Life",
    setupGeometry: (geometry: Geometry) => {
      // Create central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(0.5), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // Create the first ring of 6 circles
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(1, i);
        geometry.createCircle(point, getPolarGridRadius(0.5), { strokeColor: 0xff4400, animationDuration: 3 });
      }

      // Create the second ring of 6 circles
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(2, i);
        geometry.createCircle(point, getPolarGridRadius(0.5), { strokeColor: 0xff4400, animationDuration: 3 });
      }
    }
  },
  {
    name: "Metatron's Cube",
    setupGeometry: (geometry: Geometry) => {
      // Create 3 rings of circles
      // Central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, getPolarGridRadius(0.5), {
        strokeColor: 0xff4400,
        animationDuration: 3
      });

      // First ring
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(1, i);
        geometry.createCircle(point, getPolarGridRadius(0.5), { strokeColor: 0xff4400, animationDuration: 3 });
      }

      // Second ring
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(2, i);
        geometry.createCircle(point, getPolarGridRadius(0.5), { strokeColor: 0xff4400, animationDuration: 3 });
      }

      // Create lines from center to all circles
      // Lines to first ring
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(2, i);
        geometry.createLine({ x: 0, y: 0.2, z: 0 }, point, { color: 0xff4400, animationDuration: 3 });
      }

      // Lines to second ring
      for (let i = 0; i < 6; i++) {
        const point = getPolarGridPoint(4, i);
        geometry.createLine({ x: 0, y: 0.2, z: 0 }, point, { color: 0xff4400, animationDuration: 3 });
      }

      // Connect the circles in the first ring (hexagon)
      for (let i = 0; i < 6; i++) {
        const startPoint = getPolarGridPoint(1, i);
        const endPoint = getPolarGridPoint(1, (i + 1) % 6);
        geometry.createLine(startPoint, endPoint, { color: 0xff4400, animationDuration: 3 });
      }

      // Connect the circles in the second ring (hexagon)
      for (let i = 0; i < 6; i++) {
        const startPoint = getPolarGridPoint(2, i);
        const endPoint = getPolarGridPoint(2, (i + 1) % 6);
        geometry.createLine(startPoint, endPoint, { color: 0xff4400, animationDuration: 3 });
      }

      // Connect first and second ring
      for (let i = 0; i < 6; i++) {
        const firstRingPoint = getPolarGridPoint(1, i);
        const secondRingPoint = getPolarGridPoint(2, i);
        geometry.createLine(firstRingPoint, secondRingPoint, { color: 0xff4400, animationDuration: 3 });
      }

      // Create diagonal connections between rings
      for (let i = 0; i < 6; i++) {
        const firstRingPoint = getPolarGridPoint(1, i);

        // Connect to opposite points on second ring
        const secondRingPoint1 = getPolarGridPoint(2, (i + 2) % 6);
        const secondRingPoint2 = getPolarGridPoint(2, (i + 4) % 6);

        geometry.createLine(firstRingPoint, secondRingPoint1, { color: 0xff4400, animationDuration: 3 });

        geometry.createLine(firstRingPoint, secondRingPoint2, { color: 0xff4400, animationDuration: 3 });
      }

      // Create diagonal connections between rings
      for (let i = 0; i < 6; i++) {
        const firstRingPoint = getPolarGridPoint(2, i);

        // Connect to opposite points on second ring
        const secondRingPoint1 = getPolarGridPoint(2, (i + 2) % 6);
        const secondRingPoint2 = getPolarGridPoint(2, (i + 4) % 6);

        geometry.createLine(firstRingPoint, secondRingPoint1, { color: 0xff4400, animationDuration: 3 });

        geometry.createLine(firstRingPoint, secondRingPoint2, { color: 0xff4400, animationDuration: 3 });
      }
    }
  },
  {
    name: "Germ of Life",
    setupGeometry: (geometry: Geometry) => {
      const radius = getPolarGridRadius(2.5);

      // Central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, radius, { strokeColor: 0xff4400, animationDuration: 3 });

      // Calculate the intersection angle
      const intersectionAngle = -Math.PI / 6; // 60 degrees in radians

      // Create circles at polar grid positions
      const topPoint = getPolarGridPoint(2.5, 0);
      const bottomPoint = getPolarGridPoint(2.5, 3);
      const topRightPoint = getPolarGridPoint(2.5, 1);
      const bottomRightPoint = getPolarGridPoint(2.5, 2);
      const topLeftPoint = getPolarGridPoint(2.5, 5);
      const bottomLeftPoint = getPolarGridPoint(2.5, 4);

      // Create arcs at each of the points
      geometry.createArc(topPoint, radius, intersectionAngle * 3, intersectionAngle * 7, {
        strokeColor: 0xff4400,
        animationDuration: 3,
        segments: 64
      });

      geometry.createArc(bottomPoint, radius, -intersectionAngle * 3, intersectionAngle, {
        strokeColor: 0xff4400,
        animationDuration: 3,
        segments: 64
      });

      geometry.createArc(topRightPoint, radius, intersectionAngle, intersectionAngle * 5, {
        strokeColor: 0xff4400,
        animationDuration: 3,
        segments: 64
      });

      geometry.createArc(bottomRightPoint, radius, intersectionAngle * 3, -intersectionAngle, {
        strokeColor: 0xff4400,
        animationDuration: 3,
        segments: 64
      });

      geometry.createArc(topLeftPoint, radius, intersectionAngle * 5, intersectionAngle * 9, {
        strokeColor: 0xff4400,
        animationDuration: 3,
        segments: 64
      });

      geometry.createArc(bottomLeftPoint, radius, -intersectionAngle * 5, -intersectionAngle, {
        strokeColor: 0xff4400,
        animationDuration: 3,
        segments: 64
      });
    }
  }
  // ,
  // {
  //   name: "Tree of Life",
  //   setupGeometry: (geometry: Geometry) => {
  //     // Create points at grid intersections
  //     const topPoint = getPolarGridPoint(4, 0);
  //     const bottomPoint = getPolarGridPoint(4, 3);
  //     const centerPoint = getPolarGridPoint(0, 0); // Center

  //     // Middle layer points
  //     const middleRightPoint = getPolarGridPoint(2, 1);
  //     const middleLeftPoint = getPolarGridPoint(2, 5);

  //     // Bottom layer points
  //     const bottomRightPoint = getPolarGridPoint(3, 2);
  //     const bottomLeftPoint = getPolarGridPoint(3, 4);

  //     // Middle vertical point
  //     const middleTopPoint = getPolarGridPoint(2, 0);

  //     // Create vertical lines
  //     geometry.createLine(centerPoint, topPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(centerPoint, bottomPoint, { color: 0xff4400, animationDuration: 2 });

  //     // Create diagonal lines from center
  //     geometry.createLine(centerPoint, middleRightPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(centerPoint, middleLeftPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(centerPoint, bottomRightPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(centerPoint, bottomLeftPoint, { color: 0xff4400, animationDuration: 2 });

  //     // Create top connections
  //     geometry.createLine(topPoint, middleRightPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(topPoint, middleLeftPoint, { color: 0xff4400, animationDuration: 2 });

  //     // Create bottom connections
  //     geometry.createLine(bottomPoint, bottomRightPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(bottomPoint, bottomLeftPoint, { color: 0xff4400, animationDuration: 2 });

  //     // Create side vertical connections
  //     geometry.createLine(middleRightPoint, bottomRightPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(middleLeftPoint, bottomLeftPoint, { color: 0xff4400, animationDuration: 2 });

  //     // Create horizontal connections
  //     geometry.createLine(middleRightPoint, middleLeftPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(bottomRightPoint, bottomLeftPoint, { color: 0xff4400, animationDuration: 2 });

  //     // Create middle connections
  //     geometry.createLine(middleTopPoint, middleRightPoint, { color: 0xff4400, animationDuration: 2 });
  //     geometry.createLine(middleTopPoint, middleLeftPoint, { color: 0xff4400, animationDuration: 2 });
  //   }
  // },
  // {
  //   name: "Merkaba",
  //   setupGeometry: (geometry: Geometry) => {
  //     // Create a Star Tetrahedron (Merkaba) aligned with grid points
  //     const topPoint = getPolarGridPoint(4, 0);
  //     const bottomPoint = getPolarGridPoint(4, 3);

  //     // First tetrahedron points
  //     const tetra1Point1 = getPolarGridPoint(3.5, 1);
  //     const tetra1Point2 = getPolarGridPoint(3.5, 3);
  //     const tetra1Point3 = getPolarGridPoint(3.5, 5);

  //     // Second tetrahedron points
  //     const tetra2Point1 = getPolarGridPoint(3, 0);
  //     const tetra2Point2 = getPolarGridPoint(3, 2);
  //     const tetra2Point3 = getPolarGridPoint(3, 4);

  //     // Create first tetrahedron
  //     geometry.createLine(topPoint, tetra1Point1, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(topPoint, tetra1Point2, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(topPoint, tetra1Point3, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(tetra1Point1, tetra1Point2, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(tetra1Point2, tetra1Point3, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(tetra1Point3, tetra1Point1, { color: 0xff4400, animationDuration: 3 });

  //     // Create second tetrahedron
  //     geometry.createLine(bottomPoint, tetra2Point1, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(bottomPoint, tetra2Point2, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(bottomPoint, tetra2Point3, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(tetra2Point1, tetra2Point2, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(tetra2Point2, tetra2Point3, { color: 0xff4400, animationDuration: 3 });
  //     geometry.createLine(tetra2Point3, tetra2Point1, { color: 0xff4400, animationDuration: 3 });

  //     // Fix type issues by using an array that explicitly defines the type
  //     const tetra1Points = [tetra1Point1, tetra1Point2, tetra1Point3];
  //     const tetra2Points = [tetra2Point1, tetra2Point2, tetra2Point3];

  //     // Create connecting lines between tetrahedrons
  //     for (let i = 0; i < 3; i++) {
  //       const tetra1Point = tetra1Points[i];
  //       const tetra2Point = tetra2Points[i];
  //       geometry.createLine(tetra1Point, tetra2Point, { color: 0xff4400, animationDuration: 3 });
  //     }
  //   }
  // },
  // {
  //   name: "64 Tetrahedron",
  //   setupGeometry: (geometry: Geometry) => {
  //     // Placeholder for 64 tetrahedron grid
  //     for (let i = 1; i <= 4; i++) {
  //       for (let j = 0; j < 6; j++) {
  //         const point = getPolarGridPoint(i, j);
  //         geometry.createCircle(point, 0.5, { strokeColor: 0x0088ff, animationDuration: 2 });
  //       }
  //     }
  //   }
  // },
  // {
  //   name: "Vector Equilibrium",
  //   setupGeometry: (geometry: Geometry) => {
  //     // Create a vector equilibrium (cuboctahedron) aligned with the grid
  //     // This consists of 12 vertices and 24 edges

  //     // Create top and bottom points
  //     const topPoint = getPolarGridPoint(2, 0);
  //     const bottomPoint = getPolarGridPoint(2, 3);

  //     // Create middle layer points (hexagon)
  //     const middlePoints: { x: number; y: number; z: number }[] = [];
  //     for (let i = 0; i < 6; i++) {
  //       middlePoints.push(getPolarGridPoint(1.5, i));
  //     }

  //     // Create connections between top and middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(topPoint, middlePoints[i], { color: 0x0088ff, animationDuration: 2 });
  //     }

  //     // Create connections between bottom and middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(bottomPoint, middlePoints[i], { color: 0x0088ff, animationDuration: 2 });
  //     }

  //     // Create hexagon in middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(middlePoints[i], middlePoints[(i + 1) % 6], { color: 0x0088ff, animationDuration: 2 });
  //     }
  //   }
  // },
  // {
  //   name: "Vector Equilibrium 2",
  //   setupGeometry: (geometry: Geometry) => {
  //     // Create a larger vector equilibrium with more detail
  //     // Similar to the Vector Equilibrium but with additional elements

  //     // Create top and bottom points
  //     const topPoint = getPolarGridPoint(2.5, 0);
  //     const bottomPoint = getPolarGridPoint(2.5, 3);

  //     // Create middle layer points (hexagon)
  //     const middlePointsVE2: { x: number; y: number; z: number }[] = [];
  //     for (let i = 0; i < 6; i++) {
  //       middlePointsVE2.push(getPolarGridPoint(2, i));
  //     }

  //     // Create inner layer points (hexagon)
  //     const innerPoints: { x: number; y: number; z: number }[] = [];
  //     for (let i = 0; i < 6; i++) {
  //       innerPoints.push(getPolarGridPoint(1, i));
  //     }

  //     // Create connections between top and middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(topPoint, middlePointsVE2[i], { color: 0x0088ff, animationDuration: 2 });
  //     }

  //     // Create connections between bottom and middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(bottomPoint, middlePointsVE2[i], { color: 0x0088ff, animationDuration: 2 });
  //     }

  //     // Create hexagon in middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(middlePointsVE2[i], middlePointsVE2[(i + 1) % 6], {
  //         color: 0x0088ff,
  //         animationDuration: 2
  //       });
  //     }

  //     // Create hexagon in inner layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(innerPoints[i], innerPoints[(i + 1) % 6], { color: 0x0088ff, animationDuration: 2 });
  //     }

  //     // Connect inner and middle layer
  //     for (let i = 0; i < 6; i++) {
  //       geometry.createLine(innerPoints[i], middlePointsVE2[i], { color: 0x0088ff, animationDuration: 2 });
  //     }
  //   }
  // }
];
