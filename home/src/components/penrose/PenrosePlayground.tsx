"use client";

import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import PenroseScene, { IPosition } from "./PenroseScene";
import PenroseManager from "./PenroseManager";
import PlaygroundController from "./PlaygroundController";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Controls } from "./Controls";

const initialControlValues = {
  generations: 1,
  speed: 10,
  instant: false
};

const PenrosePlayground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const theme = useTheme();
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
  } | null>(null);

  // Memoize all dependencies
  const playgroundController = useMemo(() => {
    const controller = new PlaygroundController();
    controller.generations = 3;
    controller.speed = 100;
    controller.simulate();
    return controller;
  }, []);

  const penroseManager = useMemo(() => new PenroseManager(theme.resolvedTheme || "dark"), [theme.resolvedTheme]);

  const location = useRef<IPosition | null>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0
  });

  const handleGenerationsChange = (value: number) => {
    playgroundController.generations = value;
    playgroundController.simulate();
  };

  const handleSpeedChange = (value: number) => {
    playgroundController.speed = value;
  };

  const handleInstantChange = (value: boolean) => {
    playgroundController.instantFlag = value;
    if (value) {
      // Immediately render the full pattern when instant mode is enabled
      penroseManager.steps = playgroundController.penroseLSystem.production.length;
      penroseManager.generateLines(location, playgroundController.penroseLSystem);
      if (sceneRef.current) {
        sceneRef.current.scene.clear();
        sceneRef.current.scene.add(penroseManager.renderLines());
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
      }
    }
  };

  const handleRender = () => {
    playgroundController.reset();
    playgroundController.simulate();

    if (playgroundController.instantFlag) {
      penroseManager.steps = playgroundController.penroseLSystem.production.length;
      penroseManager.generateLines(location, playgroundController.penroseLSystem);
      if (sceneRef.current) {
        sceneRef.current.scene.clear();
        sceneRef.current.scene.add(penroseManager.renderLines());
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer } = new PenroseScene();
    sceneRef.current = { scene, camera, renderer }; // Store scene reference
    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    // Adjust camera and controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);
    controls.update();

    scene.background = new THREE.Color(0xff0000);

    function animate() {
      const stepSize = Math.max(1, Math.floor(playgroundController.speed / 20));

      if (playgroundController.resetFlag) {
        playgroundController.resetFlag = false;
        scene.clear();
        penroseManager.reset();
        penroseManager.steps = 0;

        // Immediately render full pattern if in instant mode
        if (playgroundController.instantFlag) {
          penroseManager.steps = playgroundController.penroseLSystem.production.length;
          penroseManager.generateLines(location, playgroundController.penroseLSystem);
          const line = penroseManager.renderLines();
          scene.add(line);
        }
      }

      if (
        !playgroundController.instantFlag &&
        penroseManager.steps < playgroundController.penroseLSystem.production.length
      ) {
        penroseManager.steps += stepSize;
        scene.clear();
        penroseManager.generateLines(location, playgroundController.penroseLSystem);
        const line = penroseManager.renderLines();
        scene.add(line);
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Initial render
    penroseManager.generateLines(location, playgroundController.penroseLSystem);
    const initialLine = penroseManager.renderLines();
    scene.add(initialLine);
    renderer.render(scene, camera);

    animate();

    return () => {
      controls.dispose();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme.resolvedTheme, penroseManager, playgroundController]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <Controls
        onGenerationsChange={handleGenerationsChange}
        onSpeedChange={handleSpeedChange}
        onInstantChange={handleInstantChange}
        onRender={handleRender}
        initialValues={initialControlValues}
      />
    </div>
  );
};

export default PenrosePlayground;
