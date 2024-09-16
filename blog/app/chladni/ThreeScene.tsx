"use client"
import { Scene } from "app/components/threejs/Scene"
import React, { useRef, useEffect } from "react"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// import { Particle, ParticleHandler } from "./main"
import * as THREE from "three"
import { Chladni } from "./Chladni"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const scene = new Scene()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.appendChild(scene.renderer.domElement)

    const chladni = new Chladni(scene.height)

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

    // const particleHandler = new ParticleHandler(scene.scene)
    // particleHandler.shuffle()
    // console.log("particleHandler", particleHandler)

    // const animate = () => {
    //   // // console.log("particles", particles)
    //   particleHandler.update(scene.scene)
    //   console.log("particleHandler", particleHandler.particles)

    //   scene.render()
    //   requestAnimationFrame(animate)
    // }

    const handleResize = () => {
      scene.resize()
    }

    // animate()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      container.removeChild(scene.renderer.domElement)

      // window.removeEventListener("resize", handleResize)
      // window.removeEventListener("mousedown", mouse.onMouseDown)
      // window.removeEventListener("mousemove", mouse.onMouseMove)
      // window.removeEventListener("mouseup", mouse.onMouseUp)

      chladni.removeInterfaces()
    }
  }, [])
  return <div ref={containerRef} />
}
export default ThreeScene
