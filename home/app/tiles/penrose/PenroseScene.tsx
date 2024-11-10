import * as THREE from "three";

const NEAR = 10,
  FAR = 10000;

export interface IPosition {
  position: THREE.Vector3;
  rotation: number;
}

export class PenroseScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public width: number = window.innerWidth;
  public height: number = window.innerHeight;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, NEAR, FAR);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.setSize(this.width, this.height);

    this.camera.position.z = 100;

    this.camera.lookAt(0, 0, 0);
  }

  public render() {
    // this.scene.add(this.mesh)
    this.renderer.render(this.scene, this.camera);
  }

  public resize(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
