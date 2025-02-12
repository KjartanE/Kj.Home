"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";
import { AudioAnalyzer } from "@/lib/three/audio";

// Add these constants at the top of the file, outside the component
const DARK_MODE = {
  background: "#09090b",
  lineLeft: 0x00ff00, // Green
  lineRight: 0x008800, // Darker Green
  heatmap: 0xff0000 // Red
};

const LIGHT_MODE = {
  background: "#ffffff",
  lineLeft: 0x0000ff, // Blue
  lineRight: 0x000088, // Darker Blue
  heatmap: 0xff0000 // Red
};

export default function WaveformScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const lineLeftRef = useRef<THREE.Line | null>(null);
  const lineRightRef = useRef<THREE.Line | null>(null);
  const materialLeftRef = useRef<THREE.LineBasicMaterial | null>(null);
  const materialRightRef = useRef<THREE.LineBasicMaterial | null>(null);
  const geometryLeftRef = useRef<THREE.BufferGeometry | null>(null);
  const geometryRightRef = useRef<THREE.BufferGeometry | null>(null);
  const heatMapPointsRef = useRef<THREE.Points | null>(null);
  const heatMapMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const heatMapGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  const startAudioCapture = async () => {
    try {
      const analyzer = new AudioAnalyzer(4096);
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

    if (materialLeftRef.current) {
      const color = theme.resolvedTheme === "dark" ? DARK_MODE.lineLeft : LIGHT_MODE.lineLeft;
      console.log("Setting line color to:", color.toString(16));
      materialLeftRef.current.color.setHex(color);
    }
    if (materialRightRef.current) {
      const colorRight = theme.resolvedTheme === "dark" ? DARK_MODE.lineRight : LIGHT_MODE.lineRight;
      console.log("Setting right line color to:", colorRight.toString(16));
      materialRightRef.current.color.setHex(colorRight);
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

    // Create heatmap Material
    const heatMapMaterial = new THREE.PointsMaterial({
      color: theme.resolvedTheme === "dark" ? DARK_MODE.heatmap : LIGHT_MODE.heatmap,
      size: 0.02,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: false
    });
    heatMapMaterialRef.current = heatMapMaterial;

    // Create materials for both channels
    const materialLeft = new THREE.LineBasicMaterial({
      color: theme.resolvedTheme === "dark" ? DARK_MODE.lineLeft : LIGHT_MODE.lineLeft,
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
      blending: THREE.NormalBlending
    });
    materialLeftRef.current = materialLeft;

    const materialRight = new THREE.LineBasicMaterial({
      color: theme.resolvedTheme === "dark" ? DARK_MODE.lineRight : LIGHT_MODE.lineRight,
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
      blending: THREE.NormalBlending
    });
    materialRightRef.current = materialRight;

    // Create heatmap geometry with initial positions and colors
    const heatMapGeometry = new THREE.BufferGeometry();
    const heatMapPositions = new Float32Array(4096 * 3); // Match FFT size
    for (let i = 0; i < 4096; i++) {
      heatMapPositions[i * 3] = 1; // X position spread across -1 to 1
      heatMapPositions[i * 3 + 1] = -0.5; // Initial Y position
      heatMapPositions[i * 3 + 2] = 0; // Z position
    }
    heatMapGeometry.setAttribute("position", new THREE.BufferAttribute(heatMapPositions, 3));
    heatMapGeometryRef.current = heatMapGeometry;

    // Create geometries for both channels
    const geometryLeft = new THREE.BufferGeometry();
    const geometryRight = new THREE.BufferGeometry();
    const positionsLeft = new Float32Array(4096 * 3);
    const positionsRight = new Float32Array(4096 * 3);

    [geometryLeft, geometryRight].forEach((geo, idx) => {
      const pos = idx === 0 ? positionsLeft : positionsRight;
      for (let i = 0; i < 4096; i++) {
        pos[i * 3] = 1;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = 0;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    });

    geometryLeftRef.current = geometryLeft;
    geometryRightRef.current = geometryRight;

    // Create heatmap points
    const heatMapPoints = new THREE.Points(heatMapGeometry, heatMapMaterial);
    heatMapPointsRef.current = heatMapPoints;
    scene.add(heatMapPoints);

    // Create and add both lines to scene
    const lineLeft = new THREE.Line(geometryLeft, materialLeft);
    const lineRight = new THREE.Line(geometryRight, materialRight);
    lineLeftRef.current = lineLeft;
    lineRightRef.current = lineRight;
    scene.add(lineLeft);
    scene.add(lineRight);

    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= frameInterval) {
        if (analyzerRef.current) {
          if (lineLeftRef.current && lineRightRef.current) {
            analyzerRef.current.updateWaveformGeometry(lineLeftRef.current.geometry, lineRightRef.current.geometry);

            if (heatMapPointsRef.current) {
              analyzerRef.current.updateFrequencyGeometry(
                heatMapPointsRef.current.geometry,
                heatMapPointsRef.current.geometry // Use same geometry for both channels
              );
            }
          }
        }
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
      if (materialLeftRef.current) {
        materialLeftRef.current.dispose();
      }
      if (materialRightRef.current) {
        materialRightRef.current.dispose();
      }
      if (geometryLeftRef.current) {
        geometryLeftRef.current.dispose();
      }
      if (geometryRightRef.current) {
        geometryRightRef.current.dispose();
      }
      if (heatMapGeometryRef.current) {
        heatMapGeometryRef.current.dispose();
      }
      if (heatMapMaterialRef.current) {
        heatMapMaterialRef.current.dispose();
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
