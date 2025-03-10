import { MutableRefObject } from "react";
import * as THREE from "three";
import { IPosition } from "./PenroseScene";
import PenroseLSystem from "./lib/PenroseLSystem";
import { shadeLineMaterial } from "./shaders/lineMaterial";

export default class PenroseManager {
  private theme: string;
  private themeColor: number;
  private distanceScale: number;
  private baseWidth: number;

  public lineMaterial: THREE.ShaderMaterial;
  public lineGeometry: THREE.BufferGeometry;

  private stack: IPosition[];
  private positions: number[];
  private widths: number[];
  
  // Keep track of the last generated step
  private lastGeneratedStep: number;
  public steps: number;
  public drawLine: (start: THREE.Vector3, end: THREE.Vector3, width: number) => void;
  public renderLines: () => THREE.LineSegments;
  public generateLines: (location: MutableRefObject<IPosition | null>, penroseLSystem: PenroseLSystem) => void;
  public generateIncrementalLines: (location: MutableRefObject<IPosition | null>, penroseLSystem: PenroseLSystem) => THREE.LineSegments | null;

  constructor(theme: string) {
    this.theme = theme;
    this.themeColor = this.theme === "dark" ? 1.0 : 0.0;
    this.distanceScale = 0.2; // Controls how much distance affects width
    // Use a constant base width that doesn't vary during drawing
    this.baseWidth = this.theme === "dark" ? 0.01 : 0.05;
    
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineMaterial = shadeLineMaterial(this.themeColor);
    this.lineMaterial.uniforms.distanceScale.value = this.distanceScale;
    this.lineMaterial.uniforms.baseWidth.value = this.baseWidth;

    this.steps = 0;
    this.lastGeneratedStep = 0;
    this.stack = [];
    this.positions = [];
    this.widths = [];

    this.drawLine = (start: THREE.Vector3, end: THREE.Vector3, width: number) => {
      this.positions.push(start.x, start.y, start.z);
      this.positions.push(end.x, end.y, end.z);
      this.widths.push(width, width);
    };

    this.renderLines = () => {
      if (this.lineGeometry) {
        this.lineGeometry.dispose();
      }

      this.lineGeometry = new THREE.BufferGeometry();

      const positionsArray = new Float32Array(this.positions);
      const widthsArray = new Float32Array(this.widths);

      this.lineGeometry.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));
      this.lineGeometry.setAttribute("width", new THREE.BufferAttribute(widthsArray, 1));

      return new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
    };

    this.generateIncrementalLines = (location: MutableRefObject<IPosition | null>, penroseLSystem: PenroseLSystem) => {
      // If no new steps to generate, return null
      if (this.lastGeneratedStep >= this.steps) {
        return null;
      }
      
      // Store current positions and widths length to know what's new
      const startPositionIndex = this.positions.length;
      const startWidthIndex = this.widths.length;
      
      const position = location.current?.position.clone() || new THREE.Vector3(0, 0, 0);
      let rotation = location.current?.rotation || 0;
      
      // Restore stack state from previous generation
      this.stack = [];
      
      // Don't need to track pushes across loop iterations
      let repeats = 1;
      // Use constant base width - distance effect is now handled in shader
      const lineWidth = this.baseWidth;
      
      const drawLength = penroseLSystem.drawLength;
      const theta = penroseLSystem.theta;
      const production = penroseLSystem.production;
      
      // First, process up to lastGeneratedStep to recreate the state
      // but don't draw any lines during this phase
      for (let i = 0; i < this.lastGeneratedStep; i++) {
        const step = production[i];
        
        if (step === "F") {
          const nextPosition = new THREE.Vector3(
            position.x + drawLength * Math.cos(rotation),
            position.y + drawLength * Math.sin(rotation),
            0
          );
          position.copy(nextPosition);
          repeats = 1;
          // Removed old line width incrementation logic
        } else if (step === "+") {
          rotation += theta * repeats;
          repeats = 1;
        } else if (step === "-") {
          rotation -= theta * repeats;
          repeats = 1;
        } else if (step === "[") {
          this.stack.push({ position: position.clone(), rotation });
        } else if (step === "]") {
          const stackPop = this.stack.pop();
          if (stackPop) {
            position.copy(stackPop?.position);
            rotation = stackPop.rotation;
          }
        } else if (step >= "0" && step <= "9") {
          repeats = Number(step);
        }
      }
      
      // Now process the new steps and actually draw the lines
      for (let i = this.lastGeneratedStep; i < this.steps; i++) {
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
          // Removed old line width incrementation logic
        } else if (step === "+") {
          rotation += theta * repeats;
          repeats = 1;
        } else if (step === "-") {
          rotation -= theta * repeats;
          repeats = 1;
        } else if (step === "[") {
          this.stack.push({ position: position.clone(), rotation });
        } else if (step === "]") {
          const stackPop = this.stack.pop();
          if (stackPop) {
            position.copy(stackPop?.position);
            rotation = stackPop.rotation;
          }
        } else if (step >= "0" && step <= "9") {
          repeats = Number(step);
        }
      }
      
      // Update lastGeneratedStep
      this.lastGeneratedStep = this.steps;
      
      // If no new lines were added, return null
      if (this.positions.length === startPositionIndex) {
        return null;
      }
      
      // Create a new geometry just for the new lines
      const newGeometry = new THREE.BufferGeometry();
      
      // Extract only the new positions and widths
      const newPositions = this.positions.slice(startPositionIndex);
      const newWidths = this.widths.slice(startWidthIndex);
      
      const positionsArray = new Float32Array(newPositions);
      const widthsArray = new Float32Array(newWidths);
      
      newGeometry.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));
      newGeometry.setAttribute("width", new THREE.BufferAttribute(widthsArray, 1));
      
      return new THREE.LineSegments(newGeometry, this.lineMaterial);
    };
  }

  public reset() {
    this.positions = [];
    this.widths = [];
    this.steps = 0;
    this.lastGeneratedStep = 0;
    this.stack = [];

    if (this.lineGeometry) {
      this.lineGeometry.dispose();
    }
    this.lineGeometry = new THREE.BufferGeometry();
  }
  
  // Update distanceScale method
  public setDistanceScale(scale: number) {
    this.distanceScale = scale;
    if (this.lineMaterial && this.lineMaterial.uniforms) {
      this.lineMaterial.uniforms.distanceScale.value = scale;
    }
  }
  
  // Set base width method
  public setBaseWidth(width: number) {
    this.baseWidth = width;
    if (this.lineMaterial && this.lineMaterial.uniforms) {
      this.lineMaterial.uniforms.baseWidth.value = width;
    }
  }
}
