import * as THREE from "three";

export default class ChladniHandler {
  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public documentObjects: any[] = [];

  constructor(size: number, color: string) {
    this.geometry = new THREE.PlaneGeometry(size, size);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: {
          value: new THREE.Vector2(size, size)
        },
        u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
        u_pi: { value: Math.PI },
        u_n: { value: 3 },
        u_m: { value: 4 },
        u_a: { value: -5 },
        u_b: { value: 20 },
        colorOne: { value: new THREE.Color(color) },
        colorTwo: { value: new THREE.Color(color) },
        opacityOne: { value: 1.0 },
        opacityTwo: { value: 1.0 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    return this;
  }

  removeInterfaces() {
    this.documentObjects.forEach((input) => {
      input.remove();
    });
  }

  createInterfaces(plane) {
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
    aSlider.min = "-100";
    aSlider.max = " 100";
    aSlider.value = "100";
    aSlider.step = "0.1";
    const aLabel = menu.appendChild(document.createElement("label"));

    aSlider.addEventListener("input", () => {
      plane.material.uniforms.u_a.value = aSlider.value;
      aLabel.innerHTML = `a: ${aSlider.value}`;
    });
    this.documentObjects.push(aSlider);
    this.documentObjects.push(aLabel);

    const bSlider = menu.appendChild(document.createElement("input"));

    bSlider.type = "range";
    bSlider.min = "-100";
    bSlider.max = "100";
    bSlider.value = "100";
    bSlider.step = "0.1";
    const bLabel = menu.appendChild(document.createElement("label"));

    bSlider.addEventListener("input", () => {
      plane.material.uniforms.u_b.value = bSlider.value;
      bLabel.innerHTML = `b: ${bSlider.value}`;
    });
    this.documentObjects.push(bSlider);
    this.documentObjects.push(bLabel);

    const nSlider = menu.appendChild(document.createElement("input"));

    nSlider.type = "range";
    nSlider.min = "0";
    nSlider.max = "100";
    nSlider.value = "3";
    nSlider.step = "1";
    const nLabel = menu.appendChild(document.createElement("label"));

    nSlider.addEventListener("input", () => {
      plane.material.uniforms.u_n.value = nSlider.value;
      nLabel.innerHTML = `n: ${nSlider.value}`;
    });
    this.documentObjects.push(nSlider);
    this.documentObjects.push(nLabel);

    const mSlider = menu.appendChild(document.createElement("input"));

    mSlider.type = "range";
    mSlider.min = "0";
    mSlider.max = "100";
    mSlider.value = "5";
    mSlider.step = "1";
    const mLabel = menu.appendChild(document.createElement("label"));

    mSlider.addEventListener("input", () => {
      plane.material.uniforms.u_m.value = mSlider.value;
      mLabel.innerHTML = `m: ${mSlider.value}`;
    });
    this.documentObjects.push(mSlider);
    this.documentObjects.push(mLabel);

    //color picker
    const colorOnePicker = menu.appendChild(document.createElement("input"));

    colorOnePicker.type = "color";
    colorOnePicker.value = this.material.uniforms.colorOne.value;
    const colorOneLabel = menu.appendChild(document.createElement("label"));

    colorOnePicker.addEventListener("input", () => {
      plane.material.uniforms.colorOne.value = new THREE.Color(colorOnePicker.value);
      colorOneLabel.innerHTML = `colorOne: ${colorOnePicker.value}`;
    });
    this.documentObjects.push(colorOnePicker);
    this.documentObjects.push(colorOneLabel);

    const colorTwoPicker = menu.appendChild(document.createElement("input"));

    colorTwoPicker.type = "color";
    colorTwoPicker.value = this.material.uniforms.colorTwo.value;
    const colorTwoLabel = menu.appendChild(document.createElement("label"));

    colorTwoPicker.addEventListener("input", () => {
      plane.material.uniforms.colorTwo.value = new THREE.Color(colorTwoPicker.value);
      colorTwoLabel.innerHTML = `colorTwo: ${colorTwoPicker.value}`;
    });
    this.documentObjects.push(colorTwoPicker);
    this.documentObjects.push(colorTwoLabel);

    //opacity sliders
    const opacityOneSlider = menu.appendChild(document.createElement("input"));

    opacityOneSlider.type = "range";
    opacityOneSlider.min = "0";
    opacityOneSlider.max = "1";
    opacityOneSlider.value = "1";
    opacityOneSlider.step = "0.01";
    const opacityOneLabel = menu.appendChild(document.createElement("label"));

    opacityOneSlider.addEventListener("input", () => {
      plane.material.uniforms.opacityOne.value = opacityOneSlider.value;
      opacityOneLabel.innerHTML = `opacityOne: ${opacityOneSlider.value}`;
    });
    this.documentObjects.push(opacityOneSlider);
    this.documentObjects.push(opacityOneLabel);

    const opacityTwoSlider = menu.appendChild(document.createElement("input"));

    opacityTwoSlider.type = "range";
    opacityTwoSlider.min = "0";
    opacityTwoSlider.max = "1";
    opacityTwoSlider.value = "1";
    opacityTwoSlider.step = "0.01";
    const opacityTwoLabel = menu.appendChild(document.createElement("label"));

    opacityTwoSlider.addEventListener("input", () => {
      plane.material.uniforms.opacityTwo.value = opacityTwoSlider.value;
      opacityTwoLabel.innerHTML = `opacityTwo: ${opacityTwoSlider.value}`;
    });
    this.documentObjects.push(opacityTwoSlider);
    this.documentObjects.push(opacityTwoLabel);

    const githubLink = menu.appendChild(document.createElement("a"));

    githubLink.href = "https://github.com/petertjmills/petermills.co/blob/master/src/components/chladni.jsx";
    githubLink.innerHTML = "source code";
    githubLink.style.color = "white";
    githubLink.style.textDecoration = "underline";
    githubLink.style.cursor = "pointer";
    githubLink.target = "_blank";
    this.documentObjects.push(githubLink);

    const fragment = document.createDocumentFragment();

    fragment.appendChild(menu);

    document.body.appendChild(fragment);
  }
}

export const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_pi;
  uniform float u_n;
  uniform float u_m;
  uniform float u_a;
  uniform float u_b;
  uniform vec3 colorOne;
  uniform vec3 colorTwo;
  uniform float opacityOne;
  uniform float opacityTwo;

  void main() {
    vec2 st = vUv;
    
    float a = u_a*sin(u_time);
    float b = u_b*cos(u_time);

    float n = u_n;
    float m = u_m;

    float x = st.x;
    float y = st.y;

    float r = a*sin(u_pi*x*n)*sin(u_pi*y*m) + b*sin(u_pi*x*m)*sin(u_pi*y*n);
    
    r = 1.0 - r;
    float color = r;

    if (color > 0.0) {
      gl_FragColor = (color-1.0)*vec4(colorOne,opacityOne);
    } else {
      gl_FragColor = (-color-1.0)*vec4(colorTwo,opacityTwo);
    }
  }
`;
