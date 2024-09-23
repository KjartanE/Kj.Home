"use client"
import { Tile, TileGrid, TileScene } from "./main"
import React, { useRef, useEffect } from "react"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { mouseController } from "./mouse"
// import * as THREE from "three"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  // const mouseDownPosition = useRef({ x: 0, y: 0 })
  // const isDragging = useRef(false)
  useEffect(() => {
    if (!containerRef.current) return

    // Create a new instance of the TileScene class
    const tileScene = new TileScene()
    const container = containerRef.current
    container.appendChild(tileScene.renderer.domElement)

    // Create a new instance of the OrbitControls class
    let controls = new OrbitControls(
      tileScene.camera,
      tileScene.renderer.domElement
    )
    controls.target.set(0, 0, 0)

    // Create a new instance of the TileGrid class
    const tileGrid = new TileGrid(tileScene.scene, 20, 10)
    tileGrid.generateGrid()

    // add mouseController to the scene
    // const mouse = new mouseController(
    //   tileScene.camera,
    //   tileScene.scene,
    //   tileGrid.vertices,
    //   tileGrid.meshes,
    //   mouseDownPosition,
    //   isDragging
    // )

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
    // window.addEventListener("resize", handleResize)
    // window.addEventListener("mousedown", mouse.onMouseDown)
    // window.addEventListener("mousemove", mouse.onMouseMove)
    // window.addEventListener("mouseup", mouse.onMouseUp)

    // Clean up the event listener when the component is unmounted
    return () => {
      container.removeChild(tileScene.renderer.domElement)
      window.removeEventListener("resize", handleResize)
      // window.removeEventListener("mousedown", mouse.onMouseDown)
      // window.removeEventListener("mousemove", mouse.onMouseMove)
      // window.removeEventListener("mouseup", mouse.onMouseUp)
    }
  }, [])
  return <div className="fixed top-0 z-0" ref={containerRef} />
}
export default ThreeScene
