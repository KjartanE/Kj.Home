"use client";

import { AudioAnalyzer } from "@/lib/three/audio";
import butterchurn from "butterchurn";
import isButterchurnSupported from "butterchurn/lib/isSupported.min";
import { useRef, useState, useEffect, useCallback } from "react";
import butterchurnPresets from "butterchurn-presets";
import { ButterchurnControls } from "./ButterchurnControls";

export default function ButterchurnScene() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(22);
  const presetsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      analyzerRef.current?.dispose();
    };
  }, []);

  const loadNextPreset = useCallback(() => {
    if (!visualizerRef.current) return;

    const presetKeys = Object.keys(presetsRef.current);
    const nextIndex = (currentPresetIndex + 1) % presetKeys.length;
    const nextPreset = presetsRef.current[presetKeys[nextIndex]];

    visualizerRef.current.loadPreset(nextPreset, 0.0);
    setCurrentPresetIndex(nextIndex);
  }, [currentPresetIndex]);

  const loadPreviousPreset = useCallback(() => {
    if (!visualizerRef.current) return;

    const presetKeys = Object.keys(presetsRef.current);
    const previousIndex = (currentPresetIndex - 1 + presetKeys.length) % presetKeys.length;
    const previousPreset = presetsRef.current[presetKeys[previousIndex]];

    visualizerRef.current.loadPreset(previousPreset, 0.0);
    setCurrentPresetIndex(previousIndex);
  }, [currentPresetIndex]);

  const updateVisualizerSize = useCallback(() => {
    if (!visualizerRef.current || !canvasRef.current) return;

    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight; // Account for header

    // Use 21:9 aspect ratio (ultrawide)
    const aspectRatio = 21 / 9;
    
    // Target a more reasonable base size
    const baseWidth = Math.min(2100, availableWidth); // Increased for wider aspect ratio
    const baseHeight = Math.min(900, availableHeight);

    let width = baseWidth;
    let height = baseWidth / aspectRatio;

    // If height is too big, scale based on height
    if (height > availableHeight) {
      height = baseHeight;
      width = height * aspectRatio;
    }

    // Update canvas dimensions
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Update visualizer size
    visualizerRef.current.setRendererSize(width, height);
  }, []);

  // Add resize listener
  useEffect(() => {
    window.addEventListener("resize", updateVisualizerSize);
    return () => window.removeEventListener("resize", updateVisualizerSize);
  }, [updateVisualizerSize]);

  const startAudioCapture = async () => {
    try {
      const analyzer = new AudioAnalyzer(4096);
      analyzerRef.current = analyzer;
      await analyzer.initializeSystemAudio();

      if (!canvasRef.current || !analyzer.audioContext) {
        throw new Error("Canvas or AudioContext not initialized");
      }

      // Create Butterchurn visualizer with initial size
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      visualizerRef.current = butterchurn.createVisualizer(analyzer.audioContext, canvasRef.current, {
        width: windowWidth,
        height: windowHeight,
        pixelRatio: window.devicePixelRatio || 1
      });

      // Update size after creation
      updateVisualizerSize();

      // Store all presets in ref for later use
      presetsRef.current = butterchurnPresets.getPresets();
      const presetKeys = Object.keys(presetsRef.current);

      // Load initial preset
      const initialPreset = presetsRef.current[presetKeys[currentPresetIndex]];
      visualizerRef.current.loadPreset(initialPreset, 0.0);

      // Start rendering
      const render = () => {
        if (!visualizerRef.current || !analyzer.audioContext) return;

        // Get audio data from your analyzer
        const audioLevels = analyzerRef.current?.getButterchurnData();

        if (audioLevels) {
          // Update Butterchurn
          visualizerRef.current.render(audioLevels);
        }

        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();
      setIsCapturing(true);
      setError(null);
    } catch (err) {
      console.error("Error starting audio capture:", err);
      setError(
        "Could not access audio. Please ensure you have granted microphone permissions and are using a supported browser (Chrome/Edge recommended)."
      );
    }
  };

  if (!isButterchurnSupported()) {
    return <div>Butterchurn is not supported in this browser</div>;
  }

  return (
    <div className="fixed inset-0 mt-14 flex items-center justify-center overflow-hidden">
      <div className="relative flex items-center justify-center">
        <canvas ref={canvasRef} className="max-h-full max-w-full" />
      </div>

      <ButterchurnControls
        isCapturing={isCapturing}
        onNextPreset={loadNextPreset}
        onPreviousPreset={loadPreviousPreset}
      />

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
          <h2 className="mb-2 text-xl font-semibold">Butterchurn</h2>
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
    </div>
  );
}
