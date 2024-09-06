"use client"
import React, { useRef, useEffect } from "react"
import { cubeGenerator, cameraGenerator, sphereGenerator } from "./main"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as THREE from "three"
import DotMatrix from "./components/dot_matrix"

const density = 16
const x_upper_bound = 1024
const y_upper_bound = 1024
const z_upper_bound = 1024

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

    const sphere = sphereGenerator()
    scene.add(sphere)

    if (matrix) {
      matrix.create_matrix()

      const points = matrix.generate_points()
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      // const mesh = new THREE.Mesh(geometry, material)
      // scene.add(mesh)
      const dot_wireframe = new THREE.WireframeGeometry(geometry)

      const dots = new THREE.LineSegments(dot_wireframe)
      dots.material.depthTest = true
      dots.material.opacity = 0.25
      dots.material.transparent = true
      // dots.material.color = new THREE.Color(colour_pallet[0])

      scene.add(dots)
    }
    camera.lookAt(512, 512, 0)
    // Add this function inside the useEffect hook
    const animate = () => {
      sphere.rotation.x += 0.001
      sphere.rotation.y += 0.001
      cube.rotation.x += 0.001
      cube.rotation.y -= 0.001
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)

    }

    // Call the animate function to start the animation loop
    animate()
    window.addEventListener("resize", handleResize)

    // Clean up the event listener when the component is unmounted
    return () => {
      container.removeChild(renderer.domElement)
      window.removeEventListener("resize", handleResize)
    }
  }, [])
  return <div ref={containerRef} />
}
export default ThreeScene
