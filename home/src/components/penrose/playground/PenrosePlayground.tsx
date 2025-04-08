"use client";

import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import PenroseScene, { IPosition } from "../PenroseScene";
import PenroseManager from "../PenroseManager";
import PlaygroundController from "./PlaygroundController";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Controls } from "./Controls";

const initialControlValues = {
  rotation: 0,
  rotationSpeed: 0
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
    controller.rotation = initialControlValues.rotation;
    controller.rotationSpeed = initialControlValues.rotationSpeed;
    controller.simulate();
    return controller;
  }, []);

  const penroseManager = useMemo(() => new PenroseManager(theme.resolvedTheme || "dark"), [theme.resolvedTheme]);

  const penroseManager2 = useMemo(() => new PenroseManager(theme.resolvedTheme || "dark"), [theme.resolvedTheme]);

  const location = useRef<IPosition | null>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0
  });

  const location2 = useRef<IPosition | null>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0
  });

  // Add a reference to track the second penrose line
  const secondPenroseLineRef = useRef<THREE.Line | null>(null);

  const handleRotationChange = (value: number) => {
    playgroundController.rotation = value;
    if (location.current) {
      location.current.rotation = value;
    }

    playgroundController.rotateFlag = true;
  };

  const handleRotationSpeedChange = (value: number) => {
    playgroundController.rotationSpeed = value;
    playgroundController.rotateFlag = true;
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
      if (playgroundController.resetFlag) {
        playgroundController.resetFlag = false;
        scene.clear();
        penroseManager.reset();
        penroseManager.steps = 0;

        // Immediately render full pattern if in instant mode
        if (playgroundController.instantFlag) {
          penroseManager.steps = playgroundController.penroseLSystem.production.length;
          penroseManager.generateIncrementalLines(location, playgroundController.penroseLSystem);
          const line = penroseManager.renderLines(true);
          scene.add(line);

          penroseManager2.steps = playgroundController.penroseLSystem.production.length;
          penroseManager2.generateIncrementalLines(location2, playgroundController.penroseLSystem);
          const line2 = penroseManager2.renderLines(true);
          secondPenroseLineRef.current = line2;
          scene.add(line2);
        }
      }

      if (playgroundController.rotateFlag && location2.current) {
        if (playgroundController.rotationSpeed > 0) {
          location2.current.rotation += playgroundController.rotationSpeed;

          if (secondPenroseLineRef.current) {
            secondPenroseLineRef.current.rotation.z = location2.current.rotation;
          }
        } else {
          location2.current.rotation = playgroundController.rotation;
          penroseManager2.reset();
          penroseManager2.steps = 0;
          penroseManager2.steps = playgroundController.penroseLSystem.production.length;
          penroseManager2.generateIncrementalLines(location2, playgroundController.penroseLSystem);

          // Remove the previous second penrose line if it exists
          if (secondPenroseLineRef.current) {
            scene.remove(secondPenroseLineRef.current);
          }

          playgroundController.rotateFlag = false;
          const line2 = penroseManager2.renderLines(true);
          // Store the reference to the new line
          secondPenroseLineRef.current = line2;
          scene.add(line2);
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Initial render
    penroseManager.generateIncrementalLines(location, playgroundController.penroseLSystem);
    const initialLine = penroseManager.renderLines(true);
    scene.add(initialLine);

    penroseManager2.generateIncrementalLines(location2, playgroundController.penroseLSystem);
    const initialLine2 = penroseManager2.renderLines(true);
    // Store the reference to the initial second line
    secondPenroseLineRef.current = initialLine2;
    scene.add(initialLine2);

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
  }, [theme.resolvedTheme, penroseManager, penroseManager2, playgroundController]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <Controls
        onRotationChange={handleRotationChange}
        onRotationSpeedChange={handleRotationSpeedChange}
        initialValues={initialControlValues}
      />
    </div>
  );
};

export default PenrosePlayground;
