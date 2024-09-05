"use client"
import React, { useRef, useEffect } from "react"
import { cubeGenerator, cameraGenerator, wireframeGenerator } from "./main"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as THREE from "three"
import DotMatrix from "./components/dot_matrix"

const density = 16
const x_upper_bound = 1024
const y_upper_bound = 1024
const z_upper_bound = 1024
const colour_pallet = ["#1A357A", "#A40E00", "#DE661A", "#F6D83B", "#229786"]

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const matrix = new DotMatrix(
    x_upper_bound,
    y_upper_bound,
    z_upper_bound,
    density
  )

  useEffect(() => {
    if (!containerRef.current) return

    const { scene, camera, renderer } = cameraGenerator()

    const container = containerRef.current

    container.appendChild(renderer.domElement)

    camera.position.set(512, 512, 512.1)
    camera.lookAt(512, 512, 0)

    let controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(512, 512, 512)
    controls.update()

    const cube = cubeGenerator()
    scene.add(cube)

    const wireframe = wireframeGenerator()
    scene.add(wireframe)

    if (matrix) {
      matrix.create_matrix()

      const points = matrix.generate_points()
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      // const mesh = new THREE.Mesh(geometry, material)
      // scene.add(mesh)

      const wireframe = new THREE.WireframeGeometry(geometry)

      const line = new THREE.LineSegments(wireframe)
      line.material.depthTest = false
      line.material.opacity = 0.25
      line.material.transparent = true

      scene.add(line)
    }
    camera.lookAt(512, 512, 0)
    // Add this function inside the useEffect hook
    const animate = () => {
      wireframe.rotation.x += 0.001
      wireframe.rotation.y += 0.001
      // cube.rotation.x += 0.01
      // cube.rotation.y += 0.01
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    // Call the animate function to start the animation loop
    animate()

    // Clean up the event listener when the component is unmounted
    return () => {
      container.removeChild(renderer.domElement)
    }
  }, [])
  return <div ref={containerRef} />
}
export default ThreeScene
