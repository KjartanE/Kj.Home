"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";
import { AudioAnalyzer } from "@/lib/three/audio";

// Add these constants at the top of the file, outside the component
const DARK_MODE = {
  background: "#09090b",
  line: 0x00ff00 // Green
};

const LIGHT_MODE = {
  background: "#ffffff",
  line: 0x0000ff // Deep Blue
};

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
  const materialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

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
    // Update material color and scene background when theme changes
    console.log("Theme changed:", theme.resolvedTheme);
    if (materialRef.current) {
      const color = theme.resolvedTheme === "dark" ? DARK_MODE.line : LIGHT_MODE.line;
      console.log("Setting line color to:", color.toString(16));
      materialRef.current.color.setHex(color);
    }
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(
        theme.resolvedTheme === "dark" ? DARK_MODE.background : LIGHT_MODE.background
      );
    }
  }, [theme.resolvedTheme]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    // Set initial background color based on current theme
    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? DARK_MODE.background : LIGHT_MODE.background);
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 1;

    // Initialize renderer with better settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create material only once with initial theme color
    const material = new THREE.LineBasicMaterial({
      color: theme.resolvedTheme === "dark" ? DARK_MODE.line : LIGHT_MODE.line,
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
      blending: THREE.NormalBlending
    });
    materialRef.current = material;

    // Create geometry only once
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(2048 * 3);
    for (let i = 0; i < 2048; i++) {
      positions[i * 3] = 1;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometryRef.current = geometry;

    const line = new THREE.Line(geometry, material);
    lineRef.current = line;
    scene.add(line);

    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= frameInterval) {
        // Update waveform if we're capturing
        if (analyzerRef.current && lineRef.current) {
          analyzerRef.current.updateWaveformGeometry(lineRef.current.geometry);
        }

        // Render the scene
        renderer.render(scene, camera);
        lastTime = timestamp - (deltaTime % frameInterval);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

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
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
