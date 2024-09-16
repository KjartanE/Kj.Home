"use client"
import { Scene } from "app/components/threejs/Scene"
import React, { useRef, useEffect } from "react"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Particle, ParticleHandler } from "./main"
import * as THREE from "three"
import { Chadni } from "./chadni"

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const scene = new Scene()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.appendChild(scene.renderer.domElement)

    const chladni = new Chadni()

    const plane = new THREE.Mesh(chladni.geometry, chladni.material)
    scene.scene.add(plane)

    scene.camera.position.set(0, 0, 1)

    //window sliders for uniforms
    const aSlider = document.body.appendChild(document.createElement("input"))
    aSlider.type = "range"
    aSlider.min = "-50"
    aSlider.max = " 50"
    aSlider.value = "-5"
    aSlider.step = "0.1"
    const aLabel = document.body.appendChild(document.createElement("label"))
    aSlider.addEventListener("input", () => {
      plane.material.uniforms.u_a.value = aSlider.value
      aLabel.innerHTML = `a: ${aSlider.value}`
    })

    const bSlider = document.body.appendChild(document.createElement("input"))
    bSlider.type = "range"
    bSlider.min = "-50"
    bSlider.max = "50"
    bSlider.value = "20"
    bSlider.step = "0.1"
    const bLabel = document.body.appendChild(document.createElement("label"))
    bSlider.addEventListener("input", () => {
      plane.material.uniforms.u_b.value = bSlider.value
      bLabel.innerHTML = `b: ${bSlider.value}`
    })

    const nSlider = document.body.appendChild(document.createElement("input"))
    nSlider.type = "range"
    nSlider.min = "0"
    nSlider.max = "100"
    nSlider.value = "3"
    nSlider.step = "0.1"
    const nLabel = document.body.appendChild(document.createElement("label"))
    nSlider.addEventListener("input", () => {
      plane.material.uniforms.u_n.value = nSlider.value
      nLabel.innerHTML = `n: ${nSlider.value}`
    })

    const mSlider = document.body.appendChild(document.createElement("input"))
    mSlider.type = "range"
    mSlider.min = "0"
    mSlider.max = "100"
    mSlider.value = "4"
    mSlider.step = "0.1"
    const mLabel = document.body.appendChild(document.createElement("label"))
    mSlider.addEventListener("input", () => {
      plane.material.uniforms.u_m.value = mSlider.value
      mLabel.innerHTML = `m: ${mSlider.value}`
    })

    //color picker
    const colorOnePicker = document.body.appendChild(
      document.createElement("input")
    )
    colorOnePicker.type = "color"
    colorOnePicker.value = "#000000"
    const colorOneLabel = document.body.appendChild(
      document.createElement("label")
    )
    colorOnePicker.addEventListener("input", () => {
      plane.material.uniforms.colorOne.value = new THREE.Color(
        colorOnePicker.value
      )
      colorOneLabel.innerHTML = `colorOne: ${colorOnePicker.value}`
    })

    const colorTwoPicker = document.body.appendChild(
      document.createElement("input")
    )
    colorTwoPicker.type = "color"
    colorTwoPicker.value = "#ffffff"
    const colorTwoLabel = document.body.appendChild(
      document.createElement("label")
    )
    colorTwoPicker.addEventListener("input", () => {
      plane.material.uniforms.colorTwo.value = new THREE.Color(
        colorTwoPicker.value
      )
      colorTwoLabel.innerHTML = `colorTwo: ${colorTwoPicker.value}`
    })

    //opacity sliders
    const opacityOneSlider = document.body.appendChild(
      document.createElement("input")
    )
    opacityOneSlider.type = "range"
    opacityOneSlider.min = "0"
    opacityOneSlider.max = "1"
    opacityOneSlider.value = "1"
    opacityOneSlider.step = "0.01"
    const opacityOneLabel = document.body.appendChild(
      document.createElement("label")
    )
    opacityOneSlider.addEventListener("input", () => {
      plane.material.uniforms.opacityOne.value = opacityOneSlider.value
      opacityOneLabel.innerHTML = `opacityOne: ${opacityOneSlider.value}`
    })

    const opacityTwoSlider = document.body.appendChild(
      document.createElement("input")
    )
    opacityTwoSlider.type = "range"
    opacityTwoSlider.min = "0"
    opacityTwoSlider.max = "1"
    opacityTwoSlider.value = "1"
    opacityTwoSlider.step = "0.01"
    const opacityTwoLabel = document.body.appendChild(
      document.createElement("label")
    )
    opacityTwoSlider.addEventListener("input", () => {
      plane.material.uniforms.opacityTwo.value = opacityTwoSlider.value
      opacityTwoLabel.innerHTML = `opacityTwo: ${opacityTwoSlider.value}`
    })

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

    // const handleResize = () => {
    //   scene.resize()
    // }

    // animate()
    // window.addEventListener("resize", handleResize)

    return () => {
      // window.removeEventListener("resize", handleResize)
      container.removeChild(scene.renderer.domElement)

      // window.removeEventListener("resize", handleResize)
      // window.removeEventListener("mousedown", mouse.onMouseDown)
      // window.removeEventListener("mousemove", mouse.onMouseMove)
      // window.removeEventListener("mouseup", mouse.onMouseUp)

      document.body.removeChild(aSlider)
      document.body.removeChild(aLabel)
      document.body.removeChild(bSlider)
      document.body.removeChild(bLabel)
      document.body.removeChild(nSlider)
      document.body.removeChild(nLabel)
      document.body.removeChild(mSlider)
      document.body.removeChild(mLabel)
      document.body.removeChild(colorOnePicker)
      document.body.removeChild(colorOneLabel)
      document.body.removeChild(colorTwoPicker)
      document.body.removeChild(colorTwoLabel)
      document.body.removeChild(opacityOneSlider)
      document.body.removeChild(opacityOneLabel)
      document.body.removeChild(opacityTwoSlider)
      document.body.removeChild(opacityTwoLabel)
    }
  }, [])
  return <div ref={containerRef} />
}
export default ThreeScene
