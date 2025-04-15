"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { SceneSteps } from "./lib/SceneSteps";
import { useArrowKeys, ArrowKeyEvent } from "./lib/ArrowKeyControls";
import { GeometrySteps } from "./lib/steps";
import { PolarGrid } from "./lib/PolarGrid";
import { Scene } from "@/lib/three/scene";
import { StepMenu } from "./StepMenu";
import { TouchControls, SwipeEvent } from "./lib/TouchControls";

const ThreeScene: React.FC = () => {
  // ===== State and Refs =====
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneStepsRef = useRef<SceneSteps | null>(null);
  const polarGridRef = useRef<PolarGrid | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [expandedSubCategories, setExpandedSubCategories] = useState<Record<string, boolean>>({});
  const [allSteps, setAllSteps] = useState<{ index: number; name: string; parentCategory?: string }[]>([]);
  const [parentCategories, setParentCategories] = useState<string[]>([]);

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

  // Navigate to a specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (sceneStepsRef.current) {
      const geometry = sceneStepsRef.current.goToStep(stepIndex);
      if (geometry) {
        setCurrentStep(sceneStepsRef.current.getCurrentStepIndex());
      }
    }
  }, []);

  // Handle swipe navigation
  const handleSwipe = useCallback((swipeEvent: SwipeEvent) => {
    if (sceneStepsRef.current) {
      if (swipeEvent.direction === "right") {
        const geometry = sceneStepsRef.current.previous();
        if (geometry) {
          setCurrentStep(sceneStepsRef.current.getCurrentStepIndex());
        }
      } else if (swipeEvent.direction === "left") {
        const geometry = sceneStepsRef.current.next();
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
    const newWidth = aspectRatio * viewSize * 1.5;
    const newHeight = viewSize * 1.5;

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

    // Extract all steps and parent categories
    if (sceneSteps) {
      // Get all steps
      const steps = GeometrySteps.map((step, index) => ({
        index,
        name: step.name,
        parentCategory: step.parentCategory
      }));
      setAllSteps(steps);

      // Get unique parent categories
      const categories = new Set<string>();
      GeometrySteps.forEach((step) => {
        if (step.parentCategory) {
          categories.add(step.parentCategory);
        }
      });
      setParentCategories(Array.from(categories));

      // Initialize expanded state for sub-categories
      const initialExpandedState: Record<string, boolean> = {};
      Array.from(categories).forEach((category) => {
        initialExpandedState[category] = false; // All sub-categories collapsed by default
      });
      setExpandedSubCategories(initialExpandedState);
    }

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

  // Toggle sub-category expansion
  const toggleSubCategory = useCallback((category: string) => {
    setExpandedSubCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  // Group steps by parent category
  const getStepsByParentCategory = useCallback(
    (category: string) => {
      return allSteps.filter((step) => step.parentCategory === category);
    },
    [allSteps]
  );

  // Get steps without a parent category
  const getMainSteps = useCallback(() => {
    return allSteps.filter((step) => !step.parentCategory);
  }, [allSteps]);

  // ===== Render UI =====
  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <StepMenu
        currentStep={currentStep}
        goToStep={goToStep}
        parentCategories={parentCategories}
        expandedSubCategories={expandedSubCategories}
        toggleSubCategory={toggleSubCategory}
        getMainSteps={getMainSteps}
        getStepsByParentCategory={getStepsByParentCategory}
      />
      <TouchControls onSwipe={handleSwipe} />
    </div>
  );
};

export default ThreeScene;
