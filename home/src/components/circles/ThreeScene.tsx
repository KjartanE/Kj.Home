"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";

const CirclesScene: React.FC = () => {
  // ===== State =====
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  
  // Animation state
  const [currentStep, setCurrentStep] = useState(0);
  const maxSteps = 3; // Total number of animation steps
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState(true);
  
  // UI state
  const [stepDescription, setStepDescription] = useState("Drawing base circle...");
  const [keyControlsText, setKeyControlsText] = useState(
    "Use arrow keys to navigate: → Next, ← Previous, ↑ Replay, ↓ Reset"
  );

  // ===== Keyboard Controls =====
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          // Next step
          if (currentStep < maxSteps - 1 && !animationPlaying) {
            setCurrentStep(currentStep + 1);
            restartAnimation();
          }
          break;
        case "ArrowLeft":
          // Previous step
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            restartAnimation();
          }
          break;
        case "ArrowUp":
          // Replay animation
          if (!animationPlaying) {
            restartAnimation();
          }
          break;
        case "ArrowDown":
        case "Escape":
          // Reset
          setCurrentStep(0);
          restartAnimation();
          break;
      }
    };

    // Helper function for restarting animation
    const restartAnimation = () => {
      setAnimationProgress(0);
      setAnimationPlaying(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Show temporary key controls hint
    const timer = setTimeout(() => {
      setKeyControlsText("");
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [currentStep, animationPlaying, maxSteps]);

  // ===== Three.js Setup and Animation =====
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Capture the container ref to avoid stale reference in cleanup
    const container = containerRef.current;

    // ===== Scene Setup =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      theme.resolvedTheme === "dark" ? "#650000" : "#ffffff"
    );

    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // ===== Materials =====
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: theme.resolvedTheme === "dark" ? 0xff0000 : 0x650000,
      linewidth: 3
    });

    // ===== Base Circle Setup =====
    const radius = 3;
    const segments = 1024;
    const geometry = new THREE.CircleGeometry(radius, segments);
    
    // Extract points and filter out center vertex (which is always first)
    const circlePoints = extractPointsFromGeometry(geometry, true);
    
    // Create the base circle as a LineLoop
    const baseCircleGeometry = new THREE.BufferGeometry();
    const baseCircle = new THREE.LineLoop(baseCircleGeometry, lineMaterial);
    
    // ===== Spokes Setup =====
    const spokesGeometry = new THREE.BufferGeometry();
    const spokesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      linewidth: 3
    });
    
    // We initialize with a LineLoop but may replace it with LineSegments
    const step2Circle = new THREE.LineLoop(spokesGeometry, spokesMaterial);
    
    // ===== Add Objects to Scene =====
    scene.add(baseCircle);
    if (currentStep >= 1) scene.add(step2Circle);
    
    // ===== Helper Functions =====
    function extractPointsFromGeometry(geometry: THREE.BufferGeometry, filterCenter = false): THREE.Vector3[] {
      const positionAttribute = geometry.attributes.position;
      const points = Array.from({ length: positionAttribute.count }, (_, i) => {
        return new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
      });
      
      return filterCenter ? points.filter((_, i) => i > 0) : points;
    }
    
    function createSpokes(numSpokes: number, count: number, radius: number): THREE.Vector3[] {
      const points: THREE.Vector3[] = [];
      
      for (let i = 0; i < count; i++) {
        const angle = (i / numSpokes) * Math.PI * 2;
        const centerPoint = new THREE.Vector3(0, 0, 0);
        const outerPoint = new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        );
        
        points.push(centerPoint, outerPoint);
      }
      
      return points;
    }
    
    // ===== Animation Setup =====
    const FPS = 64; // Fixed 64 frames per second
    const frameTime = 1 / FPS; // Time per frame in seconds
    
    // ===== Animation Loop =====
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update animation progress with fixed time step
      if (animationPlaying) {
        setAnimationProgress(prev => {
          const speed = 0.001; // Animation speed factor
          const newProgress = prev + frameTime * speed * FPS; // Applying fixed time step
          
          if (newProgress >= 1) {
            setAnimationPlaying(false);
            return 1;
          }
          return newProgress;
        });
      }
      
      // Handle different animation steps
      updateAnimationStep();
      
      // Render the scene
      renderer.render(scene, camera);
    };
    
    // Function to update the current animation step
    const updateAnimationStep = () => {
      switch(currentStep) {
        case 0: 
          // Step 1: Base circle animation
          animateBaseCircle();
          setStepDescription("Drawing base circle...");
          break;
          
        case 1: 
          // Step 2: Spokes animation
          animateSpokes();
          setStepDescription("Adding spokes from center...");
          break;
          
        case 2: 
          // Step 3: Highlighting animation
          animateHighlighting();
          setStepDescription("Highlighting the structure...");
          break;
      }
    };
    
    // Animation functions for each step
    const animateBaseCircle = () => {
      const pointsToShow = Math.floor(circlePoints.length * animationProgress);
      if (pointsToShow > 1) {
        baseCircleGeometry.setFromPoints(circlePoints.slice(0, pointsToShow));
      }
    };
    
    const animateSpokes = () => {
      // Ensure base circle is complete
      baseCircleGeometry.setFromPoints(circlePoints);
      
      // Create spokes animation
      const numSpokes = 6;
      const spokesToShow = Math.floor(numSpokes * animationProgress) + 1;
      const spokePoints = createSpokes(numSpokes, spokesToShow, radius);
      
      // Set up as LineSegments if needed
      if (step2Circle.type === "LineLoop") {
        scene.remove(step2Circle);
        const spokesSegments = new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(spokePoints),
          spokesMaterial
        );
        scene.add(spokesSegments);
      } else {
        step2Circle.geometry.setFromPoints(spokePoints);
      }
    };
    
    const animateHighlighting = () => {
      // Ensure base circle is complete
      baseCircleGeometry.setFromPoints(circlePoints);
      
      // Create all 8 spokes
      const allSpokePoints = createSpokes(8, 8, radius);
      step2Circle.geometry.setFromPoints(allSpokePoints);
      
      // Add pulsing effect to the circle
      const pulseScale = 1 + Math.sin(animationProgress * Math.PI * 5) * 0.05;
      baseCircle.scale.set(pulseScale, pulseScale, 1);
    };

    // Start the animation loop
    animate();

    // Cleanup
    return () => {
      container?.removeChild(renderer.domElement);
      ThreeCleanup.disposeScene(scene);
      renderer.dispose();
    };
  }, [theme.resolvedTheme, currentStep, animationProgress, animationPlaying]);

  // ===== Render UI =====
  return (
    <div className="relative">
      <div ref={containerRef} className="fixed inset-0" />
      
      {/* Step information and progress bar */}
      <div className="fixed top-10 right-10 bg-black/70 text-white p-3 rounded">
        Step {currentStep + 1} of {maxSteps}: {stepDescription}
        <div className="w-full bg-gray-700 h-2 mt-2">
          <div 
            className="bg-blue-500 h-2" 
            style={{ width: `${animationProgress * 100}%` }}
          />
        </div>
      </div>
      
      {/* Temporary controls help */}
      {keyControlsText && (
        <div className="fixed bottom-10 left-0 right-0 flex justify-center">
          <div className="bg-black/70 text-white p-3 rounded">
            {keyControlsText}
          </div>
        </div>
      )}
    </div>
  );
};

export default CirclesScene;
