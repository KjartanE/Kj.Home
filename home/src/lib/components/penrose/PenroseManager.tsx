import { MutableRefObject } from "react";
import * as THREE from "three";
import { IPosition } from "./PenroseScene";
import PenroseLSystem from "./lib/PenroseLSystem";

export default class PenroseManager {
  private theme: string;
  private themeColor: number;

  public lineMaterial: THREE.ShaderMaterial;
  public lineGeometry: THREE.BufferGeometry;

  private stack: IPosition[];
  private positions: number[];
  private widths: number[];

  public steps: number;
  public drawLine: (start: THREE.Vector3, end: THREE.Vector3, width: number) => void;
  public renderLines: () => THREE.LineSegments;
  public generateLines: (location: MutableRefObject<IPosition | null>, penroseLSystem: PenroseLSystem) => void;

  constructor(theme: string) {
    this.theme = theme;
    this.themeColor = this.theme === "dark" ? 1.0 : 0.0;
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineMaterial = shadeLineMaterial(this.themeColor);

    this.steps = 0;
    this.stack = [];
    this.positions = [];
    this.widths = [];

    this.drawLine = (start: THREE.Vector3, end: THREE.Vector3, width: number) => {
      this.positions.push(start.x, start.y, start.z);
      this.positions.push(end.x, end.y, end.z);
      this.widths.push(width, width);
    };

    this.renderLines = () => {
      this.lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
      this.lineGeometry.setAttribute("width", new THREE.Float32BufferAttribute(this.widths, 1));
      const line = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);

      return line;
    };

    this.generateLines = (location: MutableRefObject<IPosition | null>, penroseLSystem: PenroseLSystem) => {
      this.positions = [];
      const position = location.current?.position.clone() || new THREE.Vector3(0, 0, 0);
      let rotation = location.current?.rotation || 0;

      let pushes = 0;
      let repeats = 1;
      let lineWidth = this.theme === "dark" ? 0.01 : 0.99;

      const drawLength = penroseLSystem.drawLength;
      const theta = penroseLSystem.theta;
      const production = penroseLSystem.production;

      this.steps > production.length ? (this.steps = production.length) : this.steps;

      for (let i = 0; i < this.steps; i++) {
        const step = production[i];

        if (step === "F") {
          const nextPosition = new THREE.Vector3(
            position.x + drawLength * Math.cos(rotation),
            position.y + drawLength * Math.sin(rotation),
            0
          );

          this.drawLine(position, nextPosition, lineWidth);
          position.copy(nextPosition);

          repeats = 1;
          if (this.theme === "dark") {
            lineWidth += 0.01;
          } else if (this.theme === "light") {
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
          this.stack.push({ position: position.clone(), rotation });
        } else if (step === "]") {
          const stackPop = this.stack.pop();

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
        const stackPop = this.stack.pop();

        if (stackPop) {
          position.copy(stackPop?.position);
          rotation = stackPop.rotation;
        }
        pushes--;
      }
    };
  }

  reset() {
    this.positions = [];
    this.widths = [];
    this.steps = 0;
    this.stack = [];
    this.lineGeometry = new THREE.BufferGeometry();
  }
}

export const fadeVertexShader = `
    attribute float width;
    varying float vWidth;
    void main() {
      vWidth = width;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

export const fadeFragmentShader = `
    varying float vWidth;
    uniform float themeColor;
    void main() {
      float color = mix(0.5, 1.0, themeColor);
      gl_FragColor = vec4(vWidth * color, vWidth * color, vWidth * color, 1.0);
    }
  `;

export const shadeLineMaterial = (themeColor: number) => {
  return new THREE.ShaderMaterial({
    vertexShader: fadeVertexShader,
    fragmentShader: fadeFragmentShader,
    uniforms: {
      themeColor: { value: themeColor }
    }
  });
};
