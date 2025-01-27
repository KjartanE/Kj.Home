"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { IPosition, PenroseScene } from "./PenroseScene";
import { PenroseManager } from "./PenroseManager";
import { PlaygroundController } from "./PlaygroundController";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PenrosePlayground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const playgroundController = new PlaygroundController();
  const penroseManager = new PenroseManager(theme.resolvedTheme || "dark");
  const penroseManager2 = new PenroseManager(theme.resolvedTheme || "dark");

  penroseManager.lineMaterial = new THREE.ShaderMaterial();
  penroseManager2.lineMaterial = new THREE.ShaderMaterial();

  playgroundController.simulate();

  let location = useRef<IPosition | null>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: playgroundController.rotation1
  });
  let location2 = useRef<IPosition | null>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: playgroundController.rotation2
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer, resize } = new PenroseScene();

    scene.clear();
    penroseManager.reset();
    penroseManager2.reset();

    const container = containerRef.current;

    container.appendChild(renderer.domElement);

    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? 0x000000 : 0xffffff);

    playgroundController.createInterfaces();

    let lastRenderTime = 0;
    const renderInterval = 1000 / 30; // 30 FPS

    function animate() {
      if (playgroundController.resetFlag) {
        playgroundController.resetFlag = false;

        location.current = {
          position: new THREE.Vector3(0, 0, 0),
          rotation: playgroundController.rotation1
        };

        location2.current = {
          position: new THREE.Vector3(0, 0, 0),
          rotation: playgroundController.rotation2
        };

        penroseManager.reset();
        penroseManager2.reset();
      }

      const now = Date.now();
      const delta = now - lastRenderTime;

      if (delta > renderInterval) {
        lastRenderTime = now;

        if (playgroundController.instantFlag) {
          penroseManager.steps = playgroundController.penroseLSystem.production.length;
          penroseManager2.steps = playgroundController.penroseLSystem.production.length;
        } else {
          if (penroseManager.steps < playgroundController.penroseLSystem.production.length) {
            penroseManager.steps += playgroundController.speed;
          }

          if (penroseManager2.steps < playgroundController.penroseLSystem.production.length) {
            penroseManager2.steps += playgroundController.speed;
          }
        }

        scene.clear();
        penroseManager.generateLines(location, playgroundController.penroseLSystem);
        penroseManager2.generateLines(location2, playgroundController.penroseLSystem);

        const line = penroseManager.renderLines();
        const line2 = penroseManager2.renderLines();

        scene.add(line);
        scene.add(line2);

        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Create a new instance of the OrbitControls class
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, 0, 0); // Set the target of the camera
    camera.position.z = 500; // Adjust camera position

    const handleResize = () => {
      resize(camera, renderer);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      scene.clear();
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);

      playgroundController.removeInterfaces();
    };
  }, [theme]);

  return <div ref={containerRef} className="fixed top-0 z-10" />;
};

export default PenrosePlayground;
