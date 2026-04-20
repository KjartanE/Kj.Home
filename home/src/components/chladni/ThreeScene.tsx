"use client";
import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";

import ChladniHandler from "@/components/chladni/ChladniHandler";
import { Scene } from "@/lib/three/scene";
import { Controls } from "./Controls";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const { theme, systemTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");
  const initialColor = isDark ? "#ffffff" : "#000000";

  // Scene setup — runs once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Compute initial theme state at mount time
    const dark = document.documentElement.classList.contains("dark");
    const color = dark ? "#ffffff" : "#000000";
    const bgColor = dark ? "#09090b" : "#ffffff";

    const scene = new Scene();
    sceneRef.current = scene;
    scene.renderer.setSize(800, 800);
    container.appendChild(scene.renderer.domElement);

    const chladni = new ChladniHandler(4, color);
    materialRef.current = chladni.material;
    const plane = new THREE.Mesh(chladni.geometry, chladni.material);

    scene.scene.add(plane);
    scene.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    scene.camera.position.z = 3;
    scene.scene.background = new THREE.Color(bgColor);

    let time = 0;
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      plane.material.uniforms.u_time.value = time;
      time += 0.01;
      scene.renderer.render(scene.scene, scene.camera);
    };
    animate();

    const handleResize = () => scene.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      plane.geometry.dispose();
      (plane.material as THREE.Material).dispose();
      ThreeCleanup.disposeScene(scene.scene);
      scene.renderer.dispose();
      if (container.contains(scene.renderer.domElement)) {
        container.removeChild(scene.renderer.domElement);
      }
      materialRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Update colors when theme changes — mutate material directly (no scene rebuild)
  useEffect(() => {
    if (!materialRef.current || !sceneRef.current) return;
    const dark = theme === "dark" || (theme === "system" && systemTheme === "dark");
    const newColor = dark ? "#ffffff" : "#000000";
    const col = new THREE.Color(newColor);
    materialRef.current.uniforms.colorOne.value = col.clone();
    materialRef.current.uniforms.colorTwo.value = col.clone();
    sceneRef.current.scene.background = new THREE.Color(dark ? "#09090b" : "#ffffff");
  }, [theme, systemTheme]);

  // Update a uniform directly — no state, no re-render, no scene rebuild
  const handleValueChange = useCallback((key: string, value: number | string) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    if (key === "a") u.u_a.value = Number(value);
    else if (key === "b") u.u_b.value = Number(value);
    else if (key === "n") u.u_n.value = Number(value);
    else if (key === "m") u.u_m.value = Number(value);
    else if (key === "opacityOne") u.opacityOne.value = Number(value);
    else if (key === "opacityTwo") u.opacityTwo.value = Number(value);
    else if (key === "colorOne") u.colorOne.value = new THREE.Color(value as string);
    else if (key === "colorTwo") u.colorTwo.value = new THREE.Color(value as string);
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Controls
        onValueChange={handleValueChange}
        initialValues={{ a: 100, b: 100, n: 3, m: 5, opacityOne: 1, opacityTwo: 1 }}
        color={initialColor}
      />
    </div>
  );
};

export default ThreeScene;
