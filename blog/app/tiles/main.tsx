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
const SHADOW_MAP_WIDTH = 1024,
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
    this.camera.position.z = 5
    this.camera.position.x = 5
    this.camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambient)

    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(500, 250, 500)
    light.castShadow = true
    light.shadow.camera.top = 1000
    light.shadow.camera.bottom = -1000
    light.shadow.camera.left = -1000
    light.shadow.camera.right = 1000
    light.shadow.camera.near = 50
    light.shadow.camera.far = 1500
    light.shadow.bias = 0.0001

    light.shadow.mapSize.width = SHADOW_MAP_WIDTH
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT
    this.scene.add(light)

    const helper = new THREE.CameraHelper(light.shadow.camera)
    this.scene.add(helper)

    //Plane floor receive shadows
    const planeShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({ color: 0x303030 })
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

export class TileGrid {
  public scene: THREE.Scene
  public tiles: Tile[]
  public meshes: THREE.Mesh[]
  public vertices: THREE.Vector3[]
  public gridSize: number
  public boxSize: number

  constructor(scene: THREE.Scene, gridSize: number, boxSize: number) {
    this.scene = scene
    this.tiles = []
    this.meshes = []
    this.gridSize = gridSize
    this.boxSize = boxSize
  }

  public addTile(tile: Tile) {
    this.tiles.push(tile)
    this.meshes.push(tile.mesh)
    // this.vertices.push(tile.mesh.position)
    tile.addToScene()
  }

  public generateGrid() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const tile = new Tile(
          this.scene,
          i * 10,
          0,
          j * 10,
          this.boxSize,
          1,
          0x303030,
          this.gridSize
        )
        this.addTile(tile)
      }
    }
  }
}

export class Tile {
  public x: number
  public y: number
  public z: number
  public size: number
  public height: number
  public colour: number
  public scene: THREE.Scene
  public geometry: THREE.BoxGeometry
  public material: THREE.Material
  public mesh: THREE.Mesh

  constructor(
    scene: THREE.Scene,
    x: number,
    y: number,
    z: number,
    size: number,
    height: number,
    colour: number,
    gridSize: number
  ) {
    this.scene = scene
    this.x = x
    this.y = y
    this.z = z
    this.size = size
    this.height = height
    this.colour = colour

    this.geometry = new THREE.BoxGeometry(this.size, this.height, this.size)
    this.material = new THREE.MeshDepthMaterial()
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.mesh.position.x = this.x - (this.size * gridSize) / 2
    this.mesh.position.y = this.y
    this.mesh.position.z = this.z - (this.size * gridSize) / 2

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  public addToScene() {
    this.scene.add(this.mesh)
  }

  public removeFromScene() {
    this.scene.remove(this.mesh)
  }

  public click() {
    // when cube is clicked on increase the height
    this.height += 1
    this.mesh.scale.y = this.height
    this.mesh.position.y = this.height / 2

    console.log("Clicked")
  }
}
