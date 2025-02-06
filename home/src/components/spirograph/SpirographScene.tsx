"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";

interface SpirographParams {
  R: number;
  r: number;
  d: number;
  speed: number;
  b: number;
  thirdCircle: boolean;
  thirdRadius: number;
}

interface SpirographSceneProps {
  params: SpirographParams;
}

// Helper functions for LCM calculation
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export default function SpirographScene({ params }: SpirographSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let isPageVisible = true;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? "#09090b" : "#ffffff");

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const gridHelper = new THREE.GridHelper(20, 20);
    const gridMaterial = gridHelper.material as THREE.Material;
    if (Array.isArray(gridMaterial)) {
      gridMaterial.forEach(mat => mat.opacity = 0.1);
      gridMaterial.forEach(mat => mat.transparent = true);
    } else {
      gridMaterial.opacity = 0.1;
      gridMaterial.transparent = true;
    }
    scene.add(gridHelper);

    // Create line with optimized geometry
    const maxPoints = 10000;
    const positions = new Float32Array(maxPoints * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({ 
      color: theme.resolvedTheme === "dark" ? 0x00ff00 : 0x00aa00,
    });
    
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Animation variables
    const lcmValue = lcm(params.R, params.r);
    const revolutions = lcmValue / params.r;
    const pointsPerRevolution = 1000;
    const totalPoints = revolutions * pointsPerRevolution;
    let currentPoint = 0;
    const basePointsPerFrame = 2;
    
    const animate = () => {
      if (!isPageVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const positions = line.geometry.attributes.position.array;
      const pointsThisFrame = Math.ceil(basePointsPerFrame * params.speed);
      
      for (let i = 0; i < pointsThisFrame && currentPoint < totalPoints; i++) {
        const t = (currentPoint / totalPoints) * Math.PI * 2 * revolutions;
        
        const k = params.r / params.R;
        const l = params.d / params.r;
        
        let x, y;
        if (params.thirdCircle) {
          const innerT = t * 2;
          const innerRadius = params.r * params.thirdRadius;
          
          const secondX = params.R * ((1 - k) * Math.cos(t) + l * k * Math.cos((1 - k) * t / k));
          const secondY = params.R * ((1 - k) * Math.sin(t) - l * k * Math.sin((1 - k) * t / k));
          
          x = secondX + innerRadius * Math.cos(innerT);
          y = secondY + innerRadius * Math.sin(innerT);
        } else {
          x = params.R * ((1 - k) * Math.cos(t) + l * k * Math.cos((1 - k) * t / k));
          y = params.R * ((1 - k) * Math.sin(t) - l * k * Math.sin((1 - k) * t / k));
        }
        
        const z = Math.sin(t) * params.b;

        const idx = currentPoint * 3;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;

        currentPoint++;
      }

      line.geometry.setDrawRange(0, currentPoint);
      line.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
    };

    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      controls.dispose();
      
      if (sceneRef.current) {
        ThreeCleanup.disposeScene(sceneRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }

      sceneRef.current = null;
      rendererRef.current = null;
    };
  }, [params, theme.resolvedTheme]);

  return <div ref={containerRef} className="fixed inset-0" />;
}
