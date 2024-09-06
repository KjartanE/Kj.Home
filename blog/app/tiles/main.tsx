import * as THREE from "three"

// export const colour_pallet = [
//   "#1A357A",
//   "#A40E00",
//   "#DE661A",
//   "#F6D83B",
//   "#229786",
// ]

const NEAR = 10,
  FAR = 10000
const SHADOW_MAP_WIDTH = 2048,
  SHADOW_MAP_HEIGHT = 1024

export class TileScene {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer
  public width: number = window.innerWidth
  public height: number = window.innerHeight
  // public geometry: THREE.Geometry
  // public material: THREE.Material
  // public mesh: THREE.Mesh

  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      NEAR,
      FAR
    )
    this.renderer = new THREE.WebGLRenderer()

    this.renderer.setSize(this.width, this.height)

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap // default THREE.PCFShadowMap

    this.camera.position.y = 100
    this.camera.rotation.y = 90
    this.camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambient)

    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(0, 1500, 1000)
    light.castShadow = true
    light.shadow.camera.top = 2000
    light.shadow.camera.bottom = -2000
    light.shadow.camera.left = -2000
    light.shadow.camera.right = 2000
    light.shadow.camera.near = 1200
    light.shadow.camera.far = 2500
    light.shadow.bias = 0.0001

    light.shadow.mapSize.width = SHADOW_MAP_WIDTH
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT
    this.scene.add(light)

    const helper = new THREE.CameraHelper(light.shadow.camera)
    this.scene.add(helper)

    //Plane floor receive shadows
    const planeShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial()
    ) //Material they have to be MeshPhongMaterial

    planeShadow.name = "FloorShadow"
    planeShadow.renderOrder = -2
    planeShadow.lookAt(new THREE.Vector3(0, 1, 0))
    planeShadow.receiveShadow = true
    planeShadow.position.set(0, 0, 0)
    this.scene.add(planeShadow)
  }

  public render() {
    // this.scene.add(this.mesh)
    this.renderer.render(this.scene, this.camera)
  }

  public resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

export class Tile {
  public x: number
  public y: number
  public width: number
  public height: number
  public colour: number
  public scene: THREE.Scene
  public geometry: THREE.Geometry
  public material: THREE.Material
  public mesh: THREE.Mesh

  constructor(
    scene: THREE.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    colour: number
  ) {
    this.scene = scene
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.colour = colour

    this.geometry = new THREE.BoxGeometry(this.width, 10, this.height)
    this.material = new THREE.MeshBasicMaterial({ color: this.colour })
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.mesh.position.x = this.x
    this.mesh.position.y = this.y

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  public addToScene() {
    this.scene.add(this.mesh)
  }

  public removeFromScene() {
    this.scene.remove(this.mesh)
  }
}
