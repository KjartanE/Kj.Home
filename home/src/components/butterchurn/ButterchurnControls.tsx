import { useEffect } from "react";

interface ButterchurnControlsProps {
  isCapturing: boolean;
  onNextPreset: () => void;
  onPreviousPreset: () => void;
  onRandomPreset: () => void;
}

export function ButterchurnControls({ isCapturing, onNextPreset, onPreviousPreset, onRandomPreset }: ButterchurnControlsProps) {
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
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isCapturing, onNextPreset, onPreviousPreset, onRandomPreset]);

  if (!isCapturing) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform space-y-2 text-center">
      <div className="rounded bg-black/50 px-4 py-2 text-white">
        <div className="text-sm font-medium">Controls</div>
        <div className="text-xs text-gray-300">
          <span className="mx-1">←: Previous Preset</span>
          <span className="mx-1">→: Next Preset</span>
          <span className="mx-1">Space: Random Preset</span>
        </div>
      </div>
    </div>
  );
} 