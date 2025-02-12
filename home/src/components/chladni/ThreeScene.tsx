"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";

import ChladniHandler from "@/components/chladni/ChladniHandler";
import { Scene } from "@/lib/three/scene";
import { Controls } from "./Controls";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { theme, systemTheme } = useTheme();

  const [color, setColor] = useState(
    theme === "dark" || (theme === "system" && systemTheme === "dark") ? "#ffffff" : "#000000"
  );

  const [uniforms, setUniforms] = useState({
    u_a: 100,
    u_b: 100,
    u_n: 3,
    u_m: 5,
    opacityOne: 1,
    opacityTwo: 1,
    colorOne: new THREE.Color(color),
    colorTwo: new THREE.Color(color)
  });

  const updateBackgroundColor = useCallback(() => {
    if (sceneRef.current) {
      const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");
      sceneRef.current.scene.background = new THREE.Color(isDark ? "#09090b" : "#ffffff");
      setColor(isDark ? "#ffffff" : "#000000");
    }
  }, [theme, systemTheme]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new Scene();
    sceneRef.current = scene;
    const container = containerRef.current;

    // Set fixed size for renderer
    scene.renderer.setSize(800, 800);
    container.appendChild(scene.renderer.domElement);

    const chladni = new ChladniHandler(4, color);
    const plane = new THREE.Mesh(chladni.geometry, chladni.material);

    // Update all uniforms including colors
    Object.entries(uniforms).forEach(([key, value]) => {
      if (plane.material.uniforms[key]) {
        plane.material.uniforms[key].value = value instanceof THREE.Color ? value : value;
      }
    });

    scene.scene.add(plane);

    scene.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    scene.camera.position.z = 3;

    updateBackgroundColor();

    // Update the color check and setting
    if (color !== uniforms.colorOne.getHexString()) {
      plane.material.uniforms.colorOne.value = uniforms.colorOne;
      plane.material.uniforms.colorTwo.value = uniforms.colorTwo;
    }
    let time = 0;

    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      plane.material.uniforms.u_time.value = time;
      time += 0.01;
      scene.renderer.render(scene.scene, scene.camera);
    }
    animate();

    const handleResize = () => {
      scene.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up Three.js resources
      if (plane) {
        plane.geometry.dispose();
        (plane.material as THREE.Material).dispose();
      }
      ThreeCleanup.disposeScene(scene.scene);
      scene.renderer.dispose();

      window.removeEventListener("resize", handleResize);
      if (container.contains(scene.renderer.domElement)) {
        container.removeChild(scene.renderer.domElement);
      }

      sceneRef.current = null;
    };
  }, [uniforms, updateBackgroundColor, color]);

  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");
    const newColor = isDark ? "#ffffff" : "#000000";

    // Update both colors when theme changes
    handleValueChange("colorOne", newColor);
    handleValueChange("colorTwo", newColor);
    setColor(newColor);
  }, [theme, systemTheme]);

  const handleValueChange = (key: string, value: number | string) => {
    setUniforms((prev) => ({
      ...prev,
      [key === "a"
        ? "u_a"
        : key === "b"
          ? "u_b"
          : key === "n"
            ? "u_n"
            : key === "m"
              ? "u_m"
              : key === "colorOne"
                ? "colorOne"
                : key === "colorTwo"
                  ? "colorTwo"
                  : key]: key.includes("color") ? new THREE.Color(value as string) : value
    }));
  };

  return (
    <div ref={containerRef} className="h-full w-full">
      <Controls
        onValueChange={handleValueChange}
        initialValues={{
          a: uniforms.u_a,
          b: uniforms.u_b,
          n: uniforms.u_n,
          m: uniforms.u_m,
          opacityOne: uniforms.opacityOne,
          opacityTwo: uniforms.opacityTwo
        }}
        color={color}
      />
    </div>
  );
};

export default ThreeScene;
