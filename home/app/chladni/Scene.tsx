import * as THREE from "three";

export class Scene {
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;
  public width: number = window.innerWidth - 200;
  public height: number = window.innerHeight - 200;
  public backgroundColor: string = "#000000";

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-this.width, this.width, this.height, -this.height, 1, 1000);
    this.camera.position.set(0, 0, 500);
    this.camera.lookAt(0, 0, 0);

    this.scene.background = new THREE.Color(this.backgroundColor);

    this.renderer = new THREE.WebGLRenderer({ premultipliedAlpha: false });
    this.renderer.setSize(this.height, this.height);

    document.body.appendChild(this.renderer.domElement);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public resize() {
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.height, this.height);
  }
}
