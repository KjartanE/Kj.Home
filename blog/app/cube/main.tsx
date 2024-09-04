import * as THREE from "three"

export const cameraGenerator = () => {
  const width = 750
  const height = 750

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  return { scene, camera, renderer }
}

export const handleResize = (camera, renderer) => {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)

  return renderer
}

export const cubeGenerator = () => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  return cube
}
