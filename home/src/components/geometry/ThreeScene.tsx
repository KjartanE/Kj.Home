"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SceneSteps } from "./lib/SceneSteps";
import { useArrowKeys, ArrowKeyEvent } from "./lib/ArrowKeyControls";
import { GeometrySteps } from "./lib/steps";
import { PolarGrid } from "./lib/PolarGrid";

const ThreeScene: React.FC = () => {
  // ===== State and Refs =====
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneStepsRef = useRef<SceneSteps | null>(null);
  const polarGridRef = useRef<PolarGrid | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    
    // Use OrthographicCamera for true 2D view
    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = 25;
    const camera = new THREE.OrthographicCamera(
      -aspectRatio * viewSize / 2, // left
      aspectRatio * viewSize / 2,  // right
      viewSize / 2,                // top
      -viewSize / 2,               // bottom
      0.1,                         // near
      1000                         // far
    );
    camera.position.set(0, 20, 0); // Position directly above
    camera.lookAt(0, 0, 0);        // Look straight down
    camera.up.set(0, 0, -1);       // Set up vector to ensure correct orientation

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create a polar grid with 6 cardinal directions
    const polarGrid = new PolarGrid(scene, 12, 5, 6);
    polarGridRef.current = polarGrid;

    // Create a grid helper (original grid, now as a background reference)
    // const size = 20;
    // const divisions = 20;
    // const gridHelper = new THREE.GridHelper(size, divisions);
    // gridHelper.position.set(0, -0.1, 0);
    // scene.add(gridHelper);

    // Initialize SceneSteps
    const sceneSteps = new SceneSteps(scene, GeometrySteps);
    sceneStepsRef.current = sceneSteps;
    setCurrentStep(sceneSteps.getCurrentStepIndex());
    setTotalSteps(sceneSteps.getTotalSteps());

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update orthographic camera on resize
      const newAspectRatio = width / height;
      camera.left = -newAspectRatio * viewSize / 2;
      camera.right = newAspectRatio * viewSize / 2;
      camera.top = viewSize / 2;
      camera.bottom = -viewSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update geometry animations
      if (sceneStepsRef.current?.getCurrentGeometry()) {
        sceneStepsRef.current.getCurrentGeometry()?.update();
      }

      // Update polar grid if needed
      if (polarGridRef.current) {
        polarGridRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeChild(renderer.domElement);
      }
      if (sceneStepsRef.current) {
        sceneStepsRef.current.clear();
      }
      if (polarGridRef.current) {
        polarGridRef.current.dispose();
      }
    };
  }, []);

  // Handle arrow key navigation
  useArrowKeys(
    {
      onArrowKeyDown: (keyEvent: ArrowKeyEvent) => {
        if (sceneStepsRef.current) {
          if (keyEvent.direction === "right") {
            const geometry = sceneStepsRef.current.next();
            if (geometry) {
              setCurrentStep(sceneStepsRef.current.getCurrentStepIndex());
            }
          } else if (keyEvent.direction === "left") {
            const geometry = sceneStepsRef.current.previous();
            if (geometry) {
              setCurrentStep(sceneStepsRef.current.getCurrentStepIndex());
            }
          }
        }
      }
    },
    true
  );

  // ===== Render UI =====
  return (
    <div className="relative">
      <div ref={containerRef} className="fixed inset-0" />

      {/* Step Navigation */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex flex-col items-center">
        <div className="rounded-lg bg-black bg-opacity-70 px-4 py-2 text-white">
          <p>Use ← → arrow keys to navigate between steps</p>
          <p className="text-center">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThreeScene;
