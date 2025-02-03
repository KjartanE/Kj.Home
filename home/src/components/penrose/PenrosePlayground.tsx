"use client";

import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import PenroseScene from "./PenroseScene";
import PenroseManager from "./PenroseManager";
import PlaygroundController from "./PlaygroundController";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ThreeCleanup } from '@/lib/three/cleanup';
import { Controls } from "./Controls";

const PenrosePlayground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  type SceneRefs = {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    resize: (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  };
  const sceneRef = useRef<SceneRefs | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(performance.now());

  const theme = useTheme();
  const playgroundController = useMemo(() => new PlaygroundController(), []);
  const penroseManager = useMemo(
    () => new PenroseManager(theme.resolvedTheme || "dark"),
    [theme.resolvedTheme]
  );
  const penroseManager2 = useMemo(
    () => new PenroseManager(theme.resolvedTheme || "dark"),
    [theme.resolvedTheme]
  );

  penroseManager.lineMaterial = new THREE.ShaderMaterial();
  penroseManager2.lineMaterial = new THREE.ShaderMaterial();

  playgroundController.simulate();

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer, resize } = new PenroseScene();
    sceneRef.current = { scene, camera, renderer, resize };

    scene.clear();
    penroseManager.reset();
    penroseManager2.reset();

    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    scene.background = new THREE.Color(
      theme.resolvedTheme === "dark" ? 0x000000 : 0xffffff
    );

    playgroundController.createInterfaces();

    const renderInterval = 1000 / 30; // 30 FPS

    const animate = (timestamp: number) => {
      if (playgroundController.resetFlag) {
        playgroundController.resetFlag = false;
        penroseManager.reset();
        penroseManager2.reset();
      }

      const delta = timestamp - lastRenderTimeRef.current;

      if (delta > renderInterval) {
        lastRenderTimeRef.current = timestamp;

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

        const line = penroseManager.renderLines();
        const line2 = penroseManager2.renderLines();

        scene.add(line);
        scene.add(line2);

        renderer.render(scene, camera);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    camera.position.z = 500;

    const handleResize = () => {
      resize(camera, renderer);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clean up Three.js resources
      ThreeCleanup.disposeScene(scene);
      renderer.dispose();
      controls.dispose();
      
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      playgroundController.removeInterfaces();
    };
  }, [theme.resolvedTheme, penroseManager, penroseManager2, playgroundController]);

  const handleGenerationsChange = (value: number) => {
    playgroundController.generations = value;
  };

  const handleSpeedChange = (value: number) => {
    playgroundController.speed = value;
  };

  const handleInstantChange = (value: boolean) => {
    playgroundController.instantFlag = value;
  };

  const handleRotationChange = (rotation1: number, rotation2: number) => {
    playgroundController.rotation1 = rotation1;
    playgroundController.rotation2 = rotation2;
  };

  const handleRender = () => {
    playgroundController.reset();
    playgroundController.simulate();
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <Controls
        onGenerationsChange={handleGenerationsChange}
        onSpeedChange={handleSpeedChange}
        onInstantChange={handleInstantChange}
        onRotationChange={handleRotationChange}
        onRender={handleRender}
        initialValues={{
          generations: 1,
          speed: 10,
          instant: false,
          rotation1: 0,
          rotation2: 0
        }}
      />
    </div>
  );
};

export default PenrosePlayground;
