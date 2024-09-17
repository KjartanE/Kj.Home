"use client"
import { Scene } from "./Scene"
import React, { useRef, useEffect } from "react"
import * as THREE from "three"
import { ChladniHandler } from "./ChladniHandler"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!containerRef.current) return
    const scene = new Scene()

    const container = containerRef.current
    container.appendChild(scene.renderer.domElement)

    const chladni = new ChladniHandler(scene.height)

    const plane = new THREE.Mesh(chladni.geometry, chladni.material)
    scene.scene.add(plane)

    scene.camera.position.set(0, 0, 1)

    chladni.createInterfaces(plane)

    let time = 0
    function animate() {
      requestAnimationFrame(animate)
      plane.material.uniforms.u_time.value = time
      time += 0.01
      scene.renderer.render(scene.scene, scene.camera)
    }
    animate()

    const handleResize = () => {
      scene.resize()
    }

    // animate()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      container.removeChild(scene.renderer.domElement)

      chladni.removeInterfaces()
    }
  }, [])
  return <div ref={containerRef} />
}
export default ThreeScene
