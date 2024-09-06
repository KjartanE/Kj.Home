import * as THREE from "three"

// export const colour_pallet = [
//   "#1A357A",
//   "#A40E00",
//   "#DE661A",
//   "#F6D83B",
//   "#229786",
// ]

export const cameraGenerator = () => {
  const width = window.innerWidth
  const height = window.innerHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  return { scene, camera, renderer }
}


