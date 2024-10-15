"use client";

import * as THREE from "three";
import { PenroseLSystem } from "../lib/PenroseLSystem";
import { useEffect, useRef } from "react";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface IPosition {
  position: THREE.Vector3;
  rotation: number;
}

const vertexShader = `
  attribute float width;
  varying float vWidth;
  void main() {
    vWidth = width;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying float vWidth;
  void main() {
    gl_FragColor = vec4(vWidth, vWidth, vWidth, 1.0);
  }
`;

const PenroseLSystemRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const penroseLSystem = new PenroseLSystem();

  const lineMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {}
  });

  penroseLSystem.simulate(5);

  const location = useRef<IPosition | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer } = new PenroseScene();

    const container = containerRef.current;

    container.appendChild(renderer.domElement);

    let steps = 0;
    const stack: IPosition[] = [];

    const lineGeometry = new THREE.BufferGeometry();
    let positions: number[] = [];
    let widths: number[] = [];

    function drawLine(start: THREE.Vector3, end: THREE.Vector3, width: number) {
      positions.push(start.x, start.y, start.z);
      positions.push(end.x, end.y, end.z);
      widths.push(width, width);
    }

    function renderLines() {
      // Populate positions array for all lines
      // After the loop, add positions to the geometry
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      lineGeometry.setAttribute("width", new THREE.Float32BufferAttribute(widths, 1));

      // Create a single line mesh
      const line = new THREE.LineSegments(lineGeometry, lineMaterial);

      scene.add(line);
    }

    function generateLines() {
      positions = [];
      const position = location.current?.position.clone() || new THREE.Vector3(0, 0, 0);
      let rotation = location.current?.rotation || 0;

      let pushes = 0;
      let repeats = 1;
      let lineWidth = 0.1;

      const drawLength = penroseLSystem.drawLength;
      const theta = penroseLSystem.theta;
      let production = penroseLSystem.production;

      steps > production.length ? (steps = production.length) : steps;

      for (let i = 0; i < steps; i++) {
        const step = production[i];

        if (step === "F") {
          const nextPosition = new THREE.Vector3(
            position.x + drawLength * Math.cos(rotation),
            position.y + drawLength * Math.sin(rotation),
            0
          );

          drawLine(position, nextPosition, lineWidth);
          position.copy(nextPosition);

          repeats = 1;
          lineWidth += 0.01; // Increase line width progressively
        } else if (step === "+") {
          rotation += theta * repeats;
          repeats = 1;
        } else if (step === "-") {
          rotation -= theta * repeats;
          repeats = 1;
        } else if (step === "[") {
          pushes++;
          stack.push({ position: position.clone(), rotation });
        } else if (step === "]") {
          const stackPop = stack.pop();

          if (stackPop) {
            position.copy(stackPop?.position);
            rotation = stackPop.rotation;
          }
          pushes--;
        } else if (step >= "0" && step <= "9") {
          repeats = Number(step);
        }
      }

      // Unpush if we need too
      while (pushes > 0) {
        const stackPop = stack.pop();

        if (stackPop) {
          position.copy(stackPop?.position);
          rotation = stackPop.rotation;
        }
        pushes--;
      }
    }

    // Create a new instance of the OrbitControls class
    // const controls = new OrbitControls(camera, renderer.domElement);

    // controls.target.set(0, 0, 0);

    // camera.position.z = 500; // Adjust camera position

    let lastRenderTime = 0;
    const renderInterval = 1000 / 30; // 30 FPS

    function animate() {
      const now = Date.now();
      const delta = now - lastRenderTime;

      if (delta > renderInterval) {
        lastRenderTime = now;
        if (steps < penroseLSystem.production.length) {
          steps += 16;
          scene.clear();
          generateLines();
          renderLines();
        }
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      // controls.dispose();

      scene.clear();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 z-10" />;
};

export default PenroseLSystemRenderer;

const NEAR = 10,
  FAR = 10000;

export class PenroseScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public width: number = window.innerWidth;
  public height: number = window.innerHeight;
  // public geometry: THREE.Geometry
  // public material: THREE.Material
  // public mesh: THREE.Mesh

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, NEAR, FAR);
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize(this.width, this.height);

    this.camera.position.z = 100;

    this.camera.lookAt(0, 0, 0);
  }

  public render() {
    // this.scene.add(this.mesh)
    this.renderer.render(this.scene, this.camera);
  }

  public resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
