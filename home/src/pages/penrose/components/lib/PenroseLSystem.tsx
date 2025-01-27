import { LSystem } from "./LSystem";

export class PenroseLSystem extends LSystem {
  steps: number = 0;
  someStep: number = 0.1;

  ruleW: string;
  ruleX: string;
  ruleY: string;
  ruleZ: string;

  constructor() {
    super();
    this.axiom = "[X]++[X]++[X]++[X]++[X]";
    this.ruleW = "YF++ZF4-XF[-YF4-WF]++";
    this.ruleX = "+YF--ZF[3-WF--XF]+";
    this.ruleY = "-WF++XF[+++YF++ZF]-";
    this.ruleZ = "--YF++++WF[+ZF++++XF]--XF";
    this.startLength = 460.0;
    this.theta = (36 * Math.PI) / 180; // Convert degrees to radians
    this.reset();
  }

  useRule(r_: string) {
    this.rule = r_;
  }

  useAxiom(a_: string) {
    this.axiom = a_;
  }

  useLength(l_: number) {
    this.startLength = l_;
  }

  useTheta(t_: number) {
    this.theta = (t_ * Math.PI) / 180;
  }

  reset() {
    this.production = this.axiom;
    this.drawLength = this.startLength;
    this.generations = 0;
  }

  getAge(): number {
    return this.generations;
  }

  render() {}

  simulate(gen: number) {
    while (this.getAge() < gen) {
      this.production = this.iterate(this.production, this.rule);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  iterate(prod_: string, rule_?: string) {
    let newProduction = "";

    for (let i = 0; i < prod_.length; i++) {
      const step = this.production.charAt(i);

      if (step == "W") {
        newProduction = newProduction + this.ruleW;
      } else if (step == "X") {
        newProduction = newProduction + this.ruleX;
      } else if (step == "Y") {
        newProduction = newProduction + this.ruleY;
      } else if (step == "Z") {
        newProduction = newProduction + this.ruleZ;
      } else {
        if (step != "F") {
          newProduction = newProduction + step;
        }
      }
    }

    this.drawLength = this.drawLength * 0.5;
    this.generations++;

    return newProduction;
  }
}
