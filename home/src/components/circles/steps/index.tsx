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

        
    }
  },
  {
    name: "Vesica Piscis",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });

      geometry.createCircle({ x: 0, y: 0, z: 0 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });

      geometry.createCircle({ x: 0, y: 0, z: 0 }, 5, { strokeColor: 0xff4400, animationDuration: 3 });
    }
  },
  {
    name: "Seed of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
    }
  },
  {
    name: "Germ of Life",
    setupGeometry: (geometry: Geometry) => {
      geometry.createLine({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { color: 0x0088ff, animationDuration: 2 });
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
