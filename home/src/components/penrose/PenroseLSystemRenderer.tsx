"use client";

import * as THREE from "three";
import PenroseLSystem from "./lib/PenroseLSystem";
import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import PenroseManager from "./PenroseManager";
import PenroseScene, { IPosition } from "./PenroseScene";
import { memo } from "react";
import { ThreeCleanup } from "@/lib/three/cleanup";

const PenroseLSystemRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const frameCountRef = useRef(0);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    resize: (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  } | null>(null);

  const theme = useTheme();

  const { penroseLSystem, penroseManager } = useMemo(() => {
    const system = new PenroseLSystem();
    const manager = new PenroseManager(theme.resolvedTheme || "dark");
    system.simulate(5);
    return { penroseLSystem: system, penroseManager: manager };
  }, [theme.resolvedTheme]);

  const location = useRef<IPosition | null>(null);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    let isPageVisible = true;
    let lastTime: number | null = null;

    const { scene, camera, renderer, resize } = new PenroseScene();
    sceneRef.current = { scene, camera, renderer, resize };
    const container = containerRef.current;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? 0x000000 : 0xffffff);

    const renderInterval = 1000 / 30;
    let accumulatedTime = 0;

    const animate = (timestamp: number) => {
      if (!isPageVisible || !sceneRef.current) {
        lastTime = null;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const delta = lastTime ? timestamp - lastTime : 0;
      lastTime = timestamp;
      accumulatedTime += delta;

      let shouldRender = false;
      while (accumulatedTime >= renderInterval) {
        if (penroseManager.steps < penroseLSystem.production.length) {
          penroseManager.steps += Math.min(24, penroseLSystem.production.length - penroseManager.steps);
          scene.clear();
          penroseManager.generateLines(location, penroseLSystem);
          const line = penroseManager.renderLines();
          scene.add(line);
          shouldRender = true;
        }

        accumulatedTime -= renderInterval;
        frameCountRef.current++;
      }

      if (shouldRender) {
        renderer.render(scene, camera);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (isPageVisible) {
        lastTime = null;
        accumulatedTime = 0;
      }
    };

    const handleResize = () => {
      if (sceneRef.current) {
        resize(camera, renderer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);

    // Force initial render
    penroseManager.generateLines(location, penroseLSystem);
    const initialLine = penroseManager.renderLines();
    scene.add(initialLine);
    renderer.render(scene, camera);

    animate(0);

    return () => {
      isInitializedRef.current = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current) {
        ThreeCleanup.disposeScene(scene);
        renderer.dispose();
      }

      if (container?.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
      location.current = null;
      penroseManager.reset();
    };
  }, [theme.resolvedTheme, penroseLSystem, penroseManager]);

  return <div ref={containerRef} className="fixed inset-0 top-0 -z-10" />;
};

export default memo(PenroseLSystemRenderer);
