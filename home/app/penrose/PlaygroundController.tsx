import { PenroseLSystem } from "../lib/PenroseLSystem";

export class PlaygroundController {
  public color: string;
  public penroseLSystem: PenroseLSystem;

  public generations: number;
  public speed: number;

  public resetFlag: boolean;
  public instantFlag: boolean;

  public rotation1: number;
  public rotation2: number;

  private documentObjects: any[] = [];

  constructor() {
    this.color = "black";
    this.penroseLSystem = new PenroseLSystem();
    this.generations = 1;
    this.speed = 10;
    this.resetFlag = false;
    this.instantFlag = false;
    this.rotation1 = 0;
    this.rotation2 = 0;
  }

  simulate(generations?: number) {
    this.penroseLSystem.simulate(generations || this.generations);
  }

  setColor(color: string) {
    this.color = color;
  }

  reset() {
    this.penroseLSystem.reset();
    this.resetFlag = true;
  }

  removeInterfaces() {
    this.documentObjects.forEach((input) => {
      input.remove();
    });
  }

  createInterfaces() {
    const menu = document.body.appendChild(document.createElement("div"));

    menu.style.position = "absolute";
    menu.style.top = "100px";
    menu.style.left = "0";
    menu.style.zIndex = "1000";
    menu.style.color = "white";
    menu.style.padding = "20px";
    menu.style.margin = "20px";
    menu.style.backgroundColor = "rgba(0,0,0,0.5)";
    menu.style.fontFamily = "sans-serif";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.gap = "10px";
    this.documentObjects.push(menu);

    //window sliders for uniforms
    const aSlider = menu.appendChild(document.createElement("input"));

    aSlider.type = "range";
    aSlider.min = "0";
    aSlider.max = "5";
    aSlider.value = "1";
    aSlider.step = "1";
    const aLabel = menu.appendChild(document.createElement("label"));

    aSlider.addEventListener("input", () => {
      aLabel.innerHTML = `generations: ${aSlider.value}`;
    });
    this.documentObjects.push(aSlider);
    this.documentObjects.push(aLabel);

    // slider for speed
    const speedSlider = menu.appendChild(document.createElement("input"));

    speedSlider.type = "range";
    speedSlider.min = "10";
    speedSlider.max = "1000";
    speedSlider.value = "10";
    speedSlider.step = "10";
    const speedLabel = menu.appendChild(document.createElement("label"));

    speedSlider.addEventListener("input", () => {
      this.speed = Number(speedSlider.value);
      speedLabel.innerHTML = `speed: ${speedSlider.value}`;
    });
    this.documentObjects.push(speedSlider);
    this.documentObjects.push(speedLabel);

    // checkbox for instant render
    const instantRender = menu.appendChild(document.createElement("input"));

    instantRender.type = "checkbox";
    instantRender.checked = false;

    instantRender.addEventListener("input", () => {
      this.instantFlag = instantRender.checked;
    });
    this.documentObjects.push(instantRender);

    // rotation slider
    const rotationSlider = menu.appendChild(document.createElement("input"));

    rotationSlider.type = "range";
    rotationSlider.min = "0";
    rotationSlider.max = "39";
    rotationSlider.value = "0";
    rotationSlider.step = "1";
    const rotationLabel = menu.appendChild(document.createElement("label"));

    rotationSlider.addEventListener("input", () => {
      this.rotation1 = Number(rotationSlider.value);
      rotationLabel.innerHTML = `rotation1: ${rotationSlider.value}`;
    });
    this.documentObjects.push(rotationSlider);
    this.documentObjects.push(rotationLabel);

    // rotation slider
    const rotationSlider2 = menu.appendChild(document.createElement("input"));

    rotationSlider2.type = "range";
    rotationSlider2.min = "0";
    rotationSlider2.max = "39";
    rotationSlider2.value = "0";
    rotationSlider2.step = "1";
    const rotationLabel2 = menu.appendChild(document.createElement("label"));

    rotationSlider2.addEventListener("input", () => {
      this.rotation2 = Number(rotationSlider2.value);
      rotationLabel2.innerHTML = `rotation2: ${rotationSlider2.value}`;
    });

    this.documentObjects.push(rotationSlider2);
    this.documentObjects.push(rotationLabel2);
    // //color picker
    // const colorOnePicker = menu.appendChild(document.createElement("input"));

    // colorOnePicker.type = "color";
    // colorOnePicker.value = "#ffffff";
    // const colorOneLabel = menu.appendChild(document.createElement("label"));

    // colorOnePicker.addEventListener("input", () => {
    //   // plane.material.uniforms.colorOne.value = new THREE.Color(colorOnePicker.value);
    //   colorOneLabel.innerHTML = `colorOne: ${colorOnePicker.value}`;
    // });
    // this.documentObjects.push(colorOnePicker);

    // render button for generating new lines
    const renderButton = menu.appendChild(document.createElement("button"));

    renderButton.innerHTML = "Render";
    renderButton.addEventListener("click", () => {
      this.reset();
      this.simulate(Number(aSlider.value));
    });
    this.documentObjects.push(renderButton);

    const fragment = document.createDocumentFragment();

    fragment.appendChild(menu);

    document.body.appendChild(fragment);
  }
}
