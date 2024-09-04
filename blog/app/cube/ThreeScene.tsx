"use client"
import React, { useRef, useEffect } from "react"
import { cubeGenerator, cameraGenerator } from "./main"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  // const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const { scene, camera, renderer } = cameraGenerator()

    const container = containerRef.current

    container.appendChild(renderer.domElement)

    camera.position.z = 2
    let controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)

    const cube = cubeGenerator()
    scene.add(cube)

    // Add this function inside the useEffect hook
    const animate = () => {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
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
