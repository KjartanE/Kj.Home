import { useEffect, useState } from "react";

interface ButterchurnControlsProps {
  isCapturing: boolean;
  onNextPreset: () => void;
  onPreviousPreset: () => void;
  onRandomPreset: () => void;
}

export function ButterchurnControls({
  isCapturing,
  onNextPreset,
  onPreviousPreset,
  onRandomPreset
}: ButterchurnControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Toggle header visibility
      const header = document.querySelector('header');
      if (header) {
        header.style.display = document.fullscreenElement ? 'none' : 'block';
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isCapturing) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          onRandomPreset();
          break;
        case "ArrowRight":
          event.preventDefault();
          onNextPreset();
          break;
        case "ArrowLeft":
          event.preventDefault();
          onPreviousPreset();
          break;
        case "Backslash":
          event.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isCapturing, onNextPreset, onPreviousPreset, onRandomPreset]);

  if (!isCapturing) return null;

  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transform space-y-2 text-center transition-opacity duration-300 ${
      isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
    }`}>
      <div className="rounded bg-black/50 px-4 py-2 text-white">
        <div className="text-sm font-medium">Controls</div>
        <div className="text-xs text-gray-300">
          <span className="mx-1">←: Previous Preset</span>
          <span className="mx-1">→: Next Preset</span>
          <span className="mx-1">Space: Random Preset</span>
          <span className="mx-1">Backslash: {isFullscreen ? "Exit" : "Enter"} Fullscreen</span>
        </div>
      </div>
    </div>
  );
}
