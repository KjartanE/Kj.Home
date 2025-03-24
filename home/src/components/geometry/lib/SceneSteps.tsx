import * as THREE from "three";
import { Geometry } from "./Geometry";

// Define a type for step configuration
export interface StepConfig {
  name: string;
  setupGeometry: (geometry: Geometry) => void;
}

export class SceneSteps {
  private scene: THREE.Scene;
  private steps: StepConfig[];
  private currentStepIndex: number = -1;
  private currentGeometry: Geometry | null = null;

  constructor(scene: THREE.Scene, steps?: StepConfig[]) {
    this.scene = scene;
    this.steps = steps || [];
    
    // If steps are provided, initialize with the first step
    if (this.steps.length > 0) {
      this.goToStep(0);
    }
  }

  /**
   * Add a new step to the steps collection
   */
  addStep(step: StepConfig): void {
    this.steps.push(step);
  }

  /**
   * Configure multiple steps at once
   */
  setSteps(steps: StepConfig[]): void {
    this.steps = steps;
    if (this.currentStepIndex === -1 && steps.length > 0) {
      this.goToStep(0);
    }
  }

  /**
   * Move to the next step and return the new Geometry instance
   * Returns null if already at the last step
   */
  next(): Geometry | null {
    if (this.currentStepIndex < this.steps.length - 1) {
      return this.goToStep(this.currentStepIndex + 1);
    }
    return null;
  }

  /**
   * Move to the previous step and return the new Geometry instance
   * Returns null if already at the first step
   */
  previous(): Geometry | null {
    if (this.currentStepIndex > 0) {
      return this.goToStep(this.currentStepIndex - 1);
    }
    return null;
  }

  /**
   * Go to a specific step by index and return the new Geometry instance
   */
  goToStep(stepIndex: number): Geometry | null {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return null;
    }

    // Clean up current geometry if it exists
    if (this.currentGeometry) {
      this.currentGeometry.clear();
    }

    // Create a new geometry for this step
    const geometry = new Geometry(this.scene);
    
    // Set up the new step using the configuration
    const step = this.steps[stepIndex];
    step.setupGeometry(geometry);
    
    // Update current state
    this.currentStepIndex = stepIndex;
    this.currentGeometry = geometry;
    
    return geometry;
  }

  /**
   * Get the current step index
   */
  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  /**
   * Get the current geometry
   */
  getCurrentGeometry(): Geometry | null {
    return this.currentGeometry;
  }

  /**
   * Get the total number of steps
   */
  getTotalSteps(): number {
    return this.steps.length;
  }

  /**
   * Reset to the first step
   */
  reset(): Geometry | null {
    if (this.steps.length > 0) {
      return this.goToStep(0);
    }
    return null;
  }

  /**
   * Clear all geometry and reset the state
   */
  clear(): void {
    if (this.currentGeometry) {
      this.currentGeometry.clear();
      this.currentGeometry = null;
    }
    this.currentStepIndex = -1;
  }
}
