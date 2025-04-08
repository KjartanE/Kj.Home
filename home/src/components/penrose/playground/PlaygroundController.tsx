import PenroseLSystem from "../lib/PenroseLSystem";

export default class PlaygroundController {
  public color: string;
  public penroseLSystem: PenroseLSystem;

  public generations: number;
  public rotation: number;
  public rotationSpeed: number;

  public resetFlag: boolean;
  public instantFlag: boolean;
  public rotateFlag: boolean;
  constructor() {
    this.color = "black";
    this.penroseLSystem = new PenroseLSystem();
    this.generations = 6;
    this.rotation = 0;
    this.rotationSpeed = 10;
    this.resetFlag = true;
    this.instantFlag = true;
    this.rotateFlag = false;
  }

  simulate(generations?: number) {
    this.penroseLSystem.reset();
    if (generations !== undefined) {
      this.generations = generations;
    }
    this.penroseLSystem.simulate(this.generations);
  }

  setColor(color: string) {
    this.color = color;
  }

  reset() {
    this.penroseLSystem.reset();
    this.resetFlag = true;
  }
}
