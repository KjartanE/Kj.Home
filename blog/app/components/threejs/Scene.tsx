import * as THREE from "three"

export class Scene {
  public scene: THREE.Scene
  public camera: THREE.OrthographicCamera
  public renderer: THREE.WebGLRenderer
  public width: number = window.innerWidth
  public height: number = window.innerHeight
  public backgroundColor: string = "#000011"

  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      1,
      1000
    )
    this.camera.position.set(0, 0, 500)
    this.camera.lookAt(0, 0, 0)

    this.scene.background = new THREE.Color(this.backgroundColor)

    this.renderer = new THREE.WebGLRenderer({ premultipliedAlpha: false })
    this.renderer.setSize(this.height, this.height)

    document.body.appendChild(this.renderer.domElement)
  }

  public render() {
    this.renderer.render(this.scene, this.camera)
  }

  public resize() {
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
