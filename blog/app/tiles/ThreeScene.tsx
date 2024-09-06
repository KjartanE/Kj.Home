"use client"
import { cameraGenerator } from "./main"
import React, { useRef, useEffect } from "react"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as THREE from "three"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const { scene, camera, renderer } = cameraGenerator()

    const container = containerRef.current

    container.appendChild(renderer.domElement)

    camera.position.z = 100
    camera.lookAt(0, 0, 0)

    const geometry = new THREE.BoxGeometry(50, 50, 50)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Add this function inside the useEffect hook
    const animate = () => {
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
  return <div className="fixed top-0 z-0" ref={containerRef} />
}
export default ThreeScene
