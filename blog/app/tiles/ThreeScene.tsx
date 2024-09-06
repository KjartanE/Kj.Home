"use client"
import { Tile, TileScene } from "./main"
import React, { useRef, useEffect } from "react"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// import * as THREE from "three"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tileScene = new TileScene()

    const container = containerRef.current

    container.appendChild(tileScene.renderer.domElement)

    let controls = new OrbitControls(tileScene.camera, tileScene.renderer.domElement)
    controls.target.set(0, 0, 0)

    const tile = new Tile(tileScene.scene, 0, 0, 10, 10, 0x111111)
    tile.addToScene()
    // Add this function inside the useEffect hook
    const animate = () => {
      tileScene.render()
      requestAnimationFrame(animate)
    }

    const handleResize = () => {
      tileScene.resize()
    }

    // Call the animate function to start the animation loop
    animate()
    window.addEventListener("resize", handleResize)

    // Clean up the event listener when the component is unmounted
    return () => {
      container.removeChild(tileScene.renderer.domElement)
      window.removeEventListener("resize", handleResize)
    }
  }, [])
  return <div className="fixed top-0 z-0" ref={containerRef} />
}
export default ThreeScene
