import * as THREE from "three";

export const colour_pallet = ["#1A357A", "#A40E00", "#DE661A", "#F6D83B", "#229786"];

export default class CubeScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public width: number;
  public height: number;

  constructor(containerWidth: number, containerHeight: number) {
    this.width = containerWidth;
    this.height = containerHeight;
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10000);
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

export const cameraGenerator = () => {
  const width = 1280;
  const height = 720;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(width, height);

  return { scene, camera, renderer };
};

export const handleResize = (camera, renderer) => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  return renderer;
};

export const cubeGenerator = () => {
  const geometry = new THREE.BoxGeometry(50, 50, 50);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  // const cube = new THREE.Mesh(geometry, material)
  // cube.position.set(512, 512, 512)

  const wireframe = new THREE.WireframeGeometry(geometry);

  const line = new THREE.LineSegments(wireframe);
  // line.material.depthTest = false
  // line.material.opacity = 0.5
  // // line.material.transparent = true
  // line.material.color = new THREE.Color(colour_pallet[0])

  line.position.set(512, 512, 512);

  // return cube
  return line;
};

export const sphereGenerator = () => {
  const geometry = new THREE.SphereGeometry(100, 100, 100);

  const wireframe = new THREE.WireframeGeometry(geometry);

  const line = new THREE.LineSegments(wireframe);
  // line.material.depthTest = false
  // line.material.opacity = 0.5
  // line.material.transparent = true
  // line.material.color = new THREE.Color(colour_pallet[1])

  line.position.set(512, 512, 512);

  return line;
};
