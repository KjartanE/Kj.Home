import PenroseLSystem from "../lib/PenroseLSystem";

export default class PlaygroundController {
  public color: string;
  public penroseLSystem: PenroseLSystem;

  public generations: number;
  public speed: number;

  public resetFlag: boolean;
  public instantFlag: boolean;

  constructor() {
    this.color = "black";
    this.penroseLSystem = new PenroseLSystem();
    this.generations = 1;
    this.speed = 10;
    this.resetFlag = false;
    this.instantFlag = false;
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
