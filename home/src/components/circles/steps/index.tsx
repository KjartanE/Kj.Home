import { Geometry } from "../Geometry";
import { StepConfig } from "../SceneSteps";

export const GeometrySteps: StepConfig[] = [
  {
    name: "Egg of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createCircle({ x: 0, y: 0, z: 0 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 0, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 1.75, y: 0, z: 1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -1.75, y: 0, z: 1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 1.75, y: 0, z: -1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -1.75, y: 0, z: -1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Fruit of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createCircle({ x: 0, y: 0, z: 0 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 0, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: 4 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -4 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 1.75, y: 0, z: 1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -1.75, y: 0, z: 1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 1.75, y: 0, z: -1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -1.75, y: 0, z: -1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 3.5, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -3.5, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 3.5, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -3.5, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Metatron's Cube",
    setupGeometry: (geometry: Geometry) => {
      geometry.createCircle({ x: 0, y: 0, z: 0 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 0, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: 4 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -4 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 1.75, y: 0, z: 1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -1.75, y: 0, z: 1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 1.75, y: 0, z: -1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -1.75, y: 0, z: -1 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 3.5, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -3.5, y: 0, z: 2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 3.5, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -3.5, y: 0, z: -2 }, 1, { strokeColor: 0xff4400, animationDuration: 3 });

      // Vertical Spokes
      geometry.createLine({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 4 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -4 }, { color: 0xff4400, animationDuration: 3 });

      // Horizontal Spokes
      geometry.createLine({ x: 0, y: 0, z: 0 }, { x: 3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 0 }, { x: -3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 0 }, { x: 3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 0 }, { x: -3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });

      // outer Perimeter Lines
      geometry.createLine({ x: 0, y: 0, z: 4 }, { x: 3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 4 }, { x: -3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -4 }, { x: 3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -4 }, { x: -3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: -3.5, y: 0, z: -2 }, { x: -3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 3.5, y: 0, z: 2 }, { x: 3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });

      // inner Perimeter Lines
      geometry.createLine({ x: 0, y: 0, z: 2 }, { x: 1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 2 }, { x: -1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -2 }, { x: 1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -2 }, { x: -1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine(
        { x: -1.75, y: 0, z: -1 },
        { x: -1.75, y: 0, z: 1 },
        { color: 0xff4400, animationDuration: 3 }
      );
      geometry.createLine({ x: 1.75, y: 0, z: 1 }, { x: 1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });

      // Outer Triangle
      geometry.createLine({ x: 0, y: 0, z: 4 }, { x: 3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 4 }, { x: -3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 2 }, { x: 3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 2 }, { x: -3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine({ x: 0, y: 0, z: -4 }, { x: 3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -4 }, { x: -3.5, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -2 }, { x: 3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -2 }, { x: -3.5, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });

      // Inner Triangle
      geometry.createLine({ x: 0, y: 0, z: 2 }, { x: 1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 2 }, { x: -1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 1 }, { x: 1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 1 }, { x: -1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine({ x: 0, y: 0, z: -2 }, { x: 1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -2 }, { x: -1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -1 }, { x: 1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -1 }, { x: -1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });

      // Acute Outer Triangle
      geometry.createLine({ x: 0, y: 0, z: 4 }, { x: 1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: 4 }, { x: -1.75, y: 0, z: -1 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine({ x: 0, y: 0, z: -4 }, { x: 1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 0, y: 0, z: -4 }, { x: -1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine({ x: 3.5, y: 0, z: 2 }, { x: 0, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: 3.5, y: 0, z: 2 }, { x: -1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine(
        { x: 3.5, y: 0, z: -2 },
        { x: -1.75, y: 0, z: -1 },
        { color: 0xff4400, animationDuration: 3 }
      );
      geometry.createLine({ x: 3.5, y: 0, z: -2 }, { x: 0, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine({ x: -3.5, y: 0, z: 2 }, { x: 0, y: 0, z: -2 }, { color: 0xff4400, animationDuration: 3 });
      geometry.createLine({ x: -3.5, y: 0, z: 2 }, { x: 1.75, y: 0, z: 1 }, { color: 0xff4400, animationDuration: 3 });

      geometry.createLine(
        { x: -3.5, y: 0, z: -2 },
        { x: 1.75, y: 0, z: -1 },
        { color: 0xff4400, animationDuration: 3 }
      );
      geometry.createLine({ x: -3.5, y: 0, z: -2 }, { x: 0, y: 0, z: 2 }, { color: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Vesica Piscis",
    setupGeometry: (geometry: Geometry) => {
      geometry.createCircle({ x: 0, y: 0, z: 0 }, 2, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: 0 }, 10, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: 4 }, 6, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -4 }, 6, { strokeColor: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Seed of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createCircle({ x: 0, y: 0, z: 0 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: 5 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 0, y: 0, z: -5 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 4.3, y: 0, z: -2.5 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: 4.3, y: 0, z: 2.5 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -4.3, y: 0, z: -2.5 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
      geometry.createCircle({ x: -4.3, y: 0, z: 2.5 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Germ of Life",
    setupGeometry: (geometry: Geometry) => {
      // The Germ of Life with half-moon arcs
      const radius = 5;
      
      // Central circle
      geometry.createCircle({ x: 0, y: 0, z: 0 }, radius, { strokeColor: 0xff4400, animationDuration: 3 });
      
      // Calculate the intersection angle (where the circles intersect)
      // When two circles of the same radius are placed one radius apart,
      // they intersect at 60 degrees from the center line
      const intersectionAngle = - Math.PI / 6; // 60 degrees in radians
      
      // Create top arc (circle centered at 0,0,radius)
      geometry.createArc(
        { x: 0, y: 0, z: radius }, // center of the arc
        radius, // radius
        Math.PI - intersectionAngle, // start angle
        2 * Math.PI + intersectionAngle, // end angle
        { strokeColor: 0xff4400, animationDuration: 3, segments: 64 }
      );
      
      // Create bottom arc (circle centered at 0,0,-radius)
      geometry.createArc(
        { x: 0, y: 0, z: -radius }, // center of the arc
        radius, // radius
        -intersectionAngle, // start angle
        Math.PI + intersectionAngle, // end angle
        { strokeColor: 0xff4400, animationDuration: 3, segments: 64 }
      );

      // Create Bottom Left Arc
      geometry.createArc(
        { x: -radius, y: 0, z: radius }, // center of the arc
        radius, // radius
        Math.PI + intersectionAngle, // start angle
        Math.PI -intersectionAngle, // end angle
      );
    }
  },
  {
    name: "Tree of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  },
  {
    name: "Merkaba",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  },
  {
    name: "64 Tetrahedron",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  },
  {
    name: "Flower of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  },
  {
    name: "Vector Equilibrium",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  },
  {
    name: "Vector Equilibrium 2",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  }
];
