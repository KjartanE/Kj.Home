export class LSystem {
  axiom: string;
  rule: string;
  production: string;

  startLength: number;
  drawLength: number;
  theta: number;

  steps: number = 0;
  generations: number;

  constructor() {
    this.axiom = "F";
    this.rule = "F+F-F";
    this.startLength = 190.0;
    this.theta = (120 * Math.PI) / 180; // Convert degrees to radians
    this.production = this.axiom;
    this.drawLength = 0;
    this.generations = 0;
  }

  reset() {
    this.production = this.axiom;
    this.drawLength = this.startLength;
    this.generations = 0;
  }

  getAge() {
    return this.generations;
  }

  render() {}

  simulate(gen: number) {
    while (this.getAge() < gen) {
      this.production = this.iterate(this.production, this.rule);
    }
  }

  iterate(prod_: string, rule_: string) {
    this.drawLength = this.drawLength * 0.6;

    this.generations++;

    let newProduction = prod_;

    newProduction = newProduction.replaceAll("F", rule_);

    return newProduction;
  }
}
