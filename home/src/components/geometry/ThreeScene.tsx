"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { SceneSteps } from "./lib/SceneSteps";
import { useArrowKeys, ArrowKeyEvent } from "./lib/ArrowKeyControls";
import { GeometrySteps } from "./lib/steps";
import { PolarGrid } from "./lib/PolarGrid";
import { Scene } from "@/lib/three/scene";

const ThreeScene: React.FC = () => {
  // ===== State and Refs =====
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneStepsRef = useRef<SceneSteps | null>(null);
  const polarGridRef = useRef<PolarGrid | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  // Animation loop with useCallback
  const animate = useCallback(() => {
    if (!sceneRef.current) return;

    animationFrameRef.current = requestAnimationFrame(animate);

    // Update geometry animations
    if (sceneStepsRef.current?.getCurrentGeometry()) {
      sceneStepsRef.current.getCurrentGeometry()?.update();
    }

    // Update polar grid if needed
    if (polarGridRef.current) {
      polarGridRef.current.update();
    }

    sceneRef.current.render();
  }, []);

  // Arrow key navigation
  const handleArrowKey = useCallback((keyEvent: ArrowKeyEvent) => {
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
  }, []);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new Scene();
    sceneRef.current = scene;
    const container = containerRef.current;

    scene.renderer.setPixelRatio(window.devicePixelRatio);
    const { width, height } = containerRef.current.getBoundingClientRect();

    const aspectRatio = width / height;
    const viewSize = 25;
    const newWidth = aspectRatio * viewSize;
    const newHeight = viewSize;

    // Set fixed size for renderer
    scene.renderer.setSize(width, height);
    container.appendChild(scene.renderer.domElement);

    // Create polar grid once
    const polarGrid = new PolarGrid(scene.scene, 10, 4, 6, new THREE.Vector3(0, 0, 0), false, 1);
    polarGridRef.current = polarGrid;

    // Initialize SceneSteps once
    const sceneSteps = new SceneSteps(scene.scene, GeometrySteps);
    sceneStepsRef.current = sceneSteps;
    setCurrentStep(sceneSteps.getCurrentStepIndex());
    setTotalSteps(sceneSteps.getTotalSteps());

    scene.camera = new THREE.OrthographicCamera(-newWidth / 2, newWidth / 2, newHeight / 2, -newHeight / 2, 0.1, 1000);
    scene.camera.position.set(0, 20, 0);
    scene.camera.lookAt(0, 0, 0);
    scene.camera.up.set(0, 0, -1);

    // Start animation loop
    animate();

    const handleResize = () => {
      scene.resize();
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);

      if (container && sceneRef.current) {
        container.removeChild(sceneRef.current.renderer.domElement);
        sceneRef.current.renderer.dispose();
      }

      if (sceneStepsRef.current) {
        sceneStepsRef.current.clear();
      }

      if (polarGridRef.current) {
        polarGridRef.current.dispose();
      }
    };
  }, [animate]);

  // Handle arrow key navigation with the memoized callback
  useArrowKeys(
    {
      onArrowKeyDown: handleArrowKey
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
