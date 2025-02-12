"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";
import { AudioAnalyzer } from "@/lib/three/audio";

export default function WaveformScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const lineRef = useRef<THREE.Line | null>(null);
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startAudioCapture = async () => {
    try {
      const analyzer = new AudioAnalyzer(2048);
      analyzerRef.current = analyzer;
      await analyzer.initializeSystemAudio();
      setIsCapturing(true);
      setError(null);
    } catch (err) {
      console.error("Error starting audio capture:", err);
      setError(
        "Could not access audio. Please ensure you have granted microphone permissions and are using a supported browser (Chrome/Edge recommended)."
      );
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? "#09090b" : "#ffffff");

    // Set up camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 1;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create material and geometry here instead
    const material = new THREE.LineBasicMaterial({
      color: theme.resolvedTheme === "dark" ? 0x00ff00 : 0x008800,
      linewidth: 1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    // Initialize all points at the right edge
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(2048 * 3);
    for (let i = 0; i < 2048; i++) {
      positions[i * 3] = 1; // Start all X coordinates at 1 (right side)
      positions[i * 3 + 1] = 0; // Y at center
      positions[i * 3 + 2] = 0; // Z at 0
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const line = new THREE.Line(geometry, material);
    lineRef.current = line;
    scene.add(line);

    const animate = () => {
      // Update waveform if we're capturing
      if (analyzerRef.current && lineRef.current) {
        analyzerRef.current.updateWaveformGeometry(lineRef.current.geometry);
      }

      // Always render the scene
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.left = -1;
      camera.right = 1;
      camera.top = height / width;
      camera.bottom = -height / width;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
      }
      if (sceneRef.current) {
        ThreeCleanup.disposeScene(sceneRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [theme.resolvedTheme]);

  return (
    <div className="relative h-screen w-screen">
      {error && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform rounded bg-red-500 px-4 py-2 text-white">
          {error}
        </div>
      )}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${
          isCapturing ? "pointer-events-none opacity-0" : "opacity-100"
        }`}>
        <div className="max-w-md px-4 text-center">
          <h2 className="mb-2 text-xl font-semibold">Audio Visualization</h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            To visualize audio, you&apos;ll need to:
            <br />
            1. Click &quot;Start Audio Capture&quot;
            <br />
            2. Grant audio permissions when prompted
            <br />
            3. For best results, use Chrome or Edge browser
          </p>
        </div>
        <button
          onClick={startAudioCapture}
          className="rounded bg-blue-500 px-6 py-3 text-lg text-white transition-colors hover:bg-blue-600">
          Start Audio Capture
        </button>
      </div>
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
