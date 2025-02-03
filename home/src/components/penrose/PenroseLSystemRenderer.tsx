"use client";

import * as THREE from "three";
import PenroseLSystem from "./lib/PenroseLSystem";
import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import PenroseManager from "./PenroseManager";
import PenroseScene, { IPosition } from "./PenroseScene";
import { memo } from "react";

const PenroseLSystemRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(null);
  const lastRenderTimeRef = useRef<number>(0);

  const theme = useTheme();
  
  const { penroseLSystem, penroseManager } = useMemo(() => {
    const system = new PenroseLSystem();
    const manager = new PenroseManager(theme.resolvedTheme || "dark");
    system.simulate(5);
    return { penroseLSystem: system, penroseManager: manager };
  }, [theme.resolvedTheme]);

  const location = useRef<IPosition | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer, resize } = new PenroseScene();
    const container = containerRef.current;

    container.appendChild(renderer.domElement);
    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? 0x000000 : 0xffffff);

    const renderInterval = 1000 / 30; // 30 FPS

    const animate = (timestamp: number) => {
      const delta = timestamp - lastRenderTimeRef.current;

      if (delta > renderInterval) {
        lastRenderTimeRef.current = timestamp;
        
        if (penroseManager.steps < penroseLSystem.production.length) {
          penroseManager.steps += 24;
          scene.clear();
          penroseManager.generateLines(location, penroseLSystem);
          const line = penroseManager.renderLines();
          scene.add(line);
        }
        
        renderer.render(scene, camera);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    const handleResize = () => {
      resize(camera, renderer);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scene.clear();
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [theme.resolvedTheme, penroseLSystem, penroseManager]);

  return <div ref={containerRef} className="fixed top-0 z-10" />;
};

export default memo(PenroseLSystemRenderer);
