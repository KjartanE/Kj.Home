"use client";

import * as THREE from "three";
import { PenroseLSystem } from "../lib/PenroseLSystem";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
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
    uniform float themeColor;
    void main() {
      float color = mix(0.5, 1.0, themeColor);
      gl_FragColor = vec4(vWidth * color, vWidth * color, vWidth * color, 1.0);
    }
  `;

const PenroseLSystemRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const penroseLSystem = new PenroseLSystem();

  const theme = useTheme();

  console.log("theme", theme);

  const themeColor = theme.resolvedTheme === "dark" ? 1.0 : 0.0;

  const lineMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      themeColor: { value: themeColor }
    }
  });

  penroseLSystem.simulate(5);

  const location = useRef<IPosition | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer, resize } = new PenroseScene();

    const container = containerRef.current;

    container.appendChild(renderer.domElement);

    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? 0x000000 : 0xffffff);

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
      let lineWidth = theme.resolvedTheme === "dark" ? 0.01 : 0.99;

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
          if (theme.resolvedTheme === "dark") {
            lineWidth += 0.01;
          } else if (theme.resolvedTheme === "light") {
            lineWidth -= 0.01;
          } else {
            lineWidth += 0.01; // Increase line width progressively
          }
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
          steps += 24;
          scene.clear();
          generateLines();
          renderLines();
        }
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      resize(camera, renderer);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // controls.dispose();

      scene.clear();
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [theme]);

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
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.setSize(this.width, this.height);

    this.camera.position.z = 100;

    this.camera.lookAt(0, 0, 0);
  }

  public render() {
    // this.scene.add(this.mesh)
    this.renderer.render(this.scene, this.camera);
  }

  public resize(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
