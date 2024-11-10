"use client";

import * as THREE from "three";
import { PenroseLSystem } from "../lib/PenroseLSystem";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { IPosition, PenroseScene } from "./PenroseScene";
import { PenroseManager } from "./PenroseManager";

const PenroseLSystemRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const penroseLSystem = new PenroseLSystem();
  const penroseManager = new PenroseManager(theme.resolvedTheme || "dark");

  penroseLSystem.simulate(5);

  const location = useRef<IPosition | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer, resize } = new PenroseScene();

    const container = containerRef.current;

    container.appendChild(renderer.domElement);

    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? 0x000000 : 0xffffff);

    let lastRenderTime = 0;
    const renderInterval = 1000 / 30; // 30 FPS

    function animate() {
      const now = Date.now();
      const delta = now - lastRenderTime;

      if (delta > renderInterval) {
        lastRenderTime = now;
        if (penroseManager.steps < penroseLSystem.production.length) {
          penroseManager.steps += 24;
          scene.clear();
          penroseManager.generateLines(location, penroseLSystem);
          const line = penroseManager.renderLines();

          scene.add(line);
        }
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      resize(camera, renderer);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      scene.clear();
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [theme]);

  return <div ref={containerRef} className="fixed top-0 z-10" />;
};

export default PenroseLSystemRenderer;
