"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { SceneSteps } from "./lib/SceneSteps";
import { useArrowKeys, ArrowKeyEvent } from "./lib/ArrowKeyControls";
import { GeometrySteps } from "./lib/steps";
import { PolarGrid } from "./lib/PolarGrid";

const ThreeScene: React.FC = () => {
  // ===== State and Refs =====
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneStepsRef = useRef<SceneSteps | null>(null);
  const polarGridRef = useRef<PolarGrid | null>(null);
  
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  // Memoize viewport calculations
  const viewportConfig = useMemo(() => {
    if (!containerRef.current) return {
      viewSize: 25,
      aspectRatio: 1,
      left: -12.5,
      right: 12.5,
      top: 12.5,
      bottom: -12.5,
    };

    const { width, height } = containerRef.current.getBoundingClientRect();
    const aspectRatio = width / height;
    const viewSize = 25;
    return {
      viewSize,
      aspectRatio,
      left: -aspectRatio * viewSize / 2,
      right: aspectRatio * viewSize / 2,
      top: viewSize / 2,
      bottom: -viewSize / 2,
    };
  }, []);

  // Handle resize with memoized resize function
  const handleResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const newAspectRatio = container.clientWidth / container.clientHeight;
    const viewSize = viewportConfig.viewSize;
    
    // Update camera properties
    cameraRef.current.left = -newAspectRatio * viewSize / 2;
    cameraRef.current.right = newAspectRatio * viewSize / 2;
    cameraRef.current.top = viewSize / 2;
    cameraRef.current.bottom = -viewSize / 2;
    cameraRef.current.updateProjectionMatrix();
    
    // Update renderer size
    rendererRef.current.setSize(container.clientWidth, container.clientHeight);
  }, [viewportConfig]);

  // Animation loop with useCallback
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    animationFrameRef.current = requestAnimationFrame(animate);

    // Update geometry animations
    if (sceneStepsRef.current?.getCurrentGeometry()) {
      sceneStepsRef.current.getCurrentGeometry()?.update();
    }

    // Update polar grid if needed
    if (polarGridRef.current) {
      polarGridRef.current.update();
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
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
    const container = containerRef.current;

    // Create scene once
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera once with memoized values
    const camera = new THREE.OrthographicCamera(
      viewportConfig.left,
      viewportConfig.right,
      viewportConfig.top,
      viewportConfig.bottom,
      0.1,
      1000
    );
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, -1);
    cameraRef.current = camera;

    // Create renderer once
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create polar grid once
    const polarGrid = new PolarGrid(
      scene, 
      10, 
      4, 
      6, 
      new THREE.Vector3(0, 0, 0), 
      false, 
      1
    );
    polarGridRef.current = polarGrid;

    // Initialize SceneSteps once
    const sceneSteps = new SceneSteps(scene, GeometrySteps);
    sceneStepsRef.current = sceneSteps;
    setCurrentStep(sceneSteps.getCurrentStepIndex());
    setTotalSteps(sceneSteps.getTotalSteps());

    // Add resize listener
    window.addEventListener("resize", handleResize);
    
    // Start animation loop
    animate();

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      if (sceneStepsRef.current) {
        sceneStepsRef.current.clear();
      }
      
      if (polarGridRef.current) {
        polarGridRef.current.dispose();
      }
    };
  }, [viewportConfig, handleResize, animate]);

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
