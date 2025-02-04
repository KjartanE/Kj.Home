import * as THREE from "three";
import { IPosition } from "./PenroseScene";
import { MutableRefObject } from "react";
import PenroseLSystem from "./lib/PenroseLSystem";
import { shadeLineMaterial } from "./shaders/lineMaterial";

export default class PenroseManager {
  private theme: string;
  private themeColor: number;
  private lineGeometry: THREE.BufferGeometry;
  private lineMaterial: THREE.Material;
  private stack: IPosition[];
  private positions: number[];
  private widths: number[];
  public steps: number;

  constructor(theme: string) {
    this.theme = theme;
    this.themeColor = this.theme === "dark" ? 1.0 : 0.0;
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineMaterial = shadeLineMaterial(this.themeColor);
    this.stack = [];
    this.positions = [];
    this.widths = [];
    this.steps = 0;
  }

  public drawLine(start: THREE.Vector3, end: THREE.Vector3, width: number) {
    this.positions.push(start.x, start.y, start.z);
    this.positions.push(end.x, end.y, end.z);
    this.widths.push(width, width);
  }

  public renderLines() {
    if (this.lineGeometry) {
      this.lineGeometry.dispose();
    }
    
    this.lineGeometry = new THREE.BufferGeometry();
    
    const positionsArray = new Float32Array(this.positions);
    const widthsArray = new Float32Array(this.widths);
    
    this.lineGeometry.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));
    this.lineGeometry.setAttribute("width", new THREE.BufferAttribute(widthsArray, 1));
    
    return new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
  }

  public generateLines(location: MutableRefObject<IPosition | null>, penroseLSystem: PenroseLSystem) {
    this.positions = [];
    this.widths = [];
    const position = location.current?.position.clone() || new THREE.Vector3(0, 0, 0);
    let rotation = location.current?.rotation || 0;

    let pushes = 0;
    let repeats = 1;
    let lineWidth = this.theme === "dark" ? 0.01 : 0.99;

    const drawLength = penroseLSystem.drawLength;
    const theta = penroseLSystem.theta;
    const production = penroseLSystem.production;

    this.steps = Math.min(this.steps, production.length);

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
        lineWidth += this.theme === "dark" ? 0.01 : -0.01;
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
          position.copy(stackPop.position);
          rotation = stackPop.rotation;
        }
        pushes--;
      } else if (step >= "0" && step <= "9") {
        repeats = Number(step);
      }
    }

    while (pushes > 0) {
      const stackPop = this.stack.pop();
      if (stackPop) {
        position.copy(stackPop.position);
        rotation = stackPop.rotation;
      }
      pushes--;
    }
  }

  public reset() {
    this.steps = 0;
    this.positions = [];
    this.widths = [];
    this.stack = [];
  }
} 