"use client";
import React, { useRef, useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { ThreeCleanup } from '@/lib/three/cleanup';
import CubeScene from "./main";
import DotMatrix from "./dot_matrix";

const density = 16;
const x_upper_bound = 1024;
const y_upper_bound = 1024;
const z_upper_bound = 1024;

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const matrix = new DotMatrix(x_upper_bound, y_upper_bound, z_upper_bound, density);
  const dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0x00ff00 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scene = new CubeScene(container.clientWidth, container.clientHeight);
    
    container.appendChild(scene.renderer.domElement);

    scene.camera.position.set(512, 512, 512.1);
    scene.camera.lookAt(512, 512, 0);

    const controls = new OrbitControls(scene.camera, scene.renderer.domElement);
    controls.target.set(512, 512, 512);
    controls.update();

    let dots: THREE.Points | null = null;
    if (matrix) {
      matrix.create_matrix();
      const points = matrix.generate_points();
      const dotGeometry = new THREE.BufferGeometry().setFromPoints(points);
      dots = new THREE.Points(dotGeometry, dotMaterial);
      scene.scene.add(dots);
    }

    const animate = () => {
      scene.renderer.render(scene.scene, scene.camera);
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      scene.camera.aspect = width / height;
      scene.camera.updateProjectionMatrix();
      scene.renderer.setSize(width, height);
    };

    const animationId = requestAnimationFrame(animate);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      
      // Clean up Three.js resources
      if (dots) {
        dots.geometry.dispose();
        (dots.material as THREE.Material).dispose();
      }
      ThreeCleanup.disposeScene(scene.scene);
      scene.renderer.dispose();
      controls.dispose();
      
      window.removeEventListener("resize", handleResize);
      if (container.contains(scene.renderer.domElement)) {
        container.removeChild(scene.renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ThreeScene;
