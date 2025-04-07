import { useEffect, useState, useRef } from "react";

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
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Detect if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      // Clear any pending timeouts when component unmounts
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        })
        .then(() => {
          console.log("Fullscreen enabled");
          setIsFullscreen(true);
        });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

    // Show controls briefly on touch
    setShowControls(true);

    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }

    // Hide controls after 3 seconds if in fullscreen
    if (isFullscreen) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Check for horizontal swipe (for changing presets)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
      if (deltaX > 0) {
        // Swipe right - previous preset
        onPreviousPreset();
      } else {
        // Swipe left - next preset
        onNextPreset();
      }
    }

    // Check for vertical swipe (for toggling fullscreen)
    if (Math.abs(deltaY) > 50 && Math.abs(deltaX) < 50) {
      if (deltaY < 0) {
        // Swipe up - enter fullscreen
        if (!isFullscreen) {
          toggleFullscreen();
        }
      } else {
        // Swipe down - exit fullscreen
        if (isFullscreen) {
          toggleFullscreen();
        }
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Toggle header visibility
      const header = document.querySelector("header");
      if (header) {
        header.style.display = document.fullscreenElement ? "none" : "block";
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      // Clear any pending timeouts when component unmounts
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
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
    <>
      {/* Touch area for gestures - covers the entire screen */}
      <div className="absolute inset-0 z-10" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />

      {/* Mobile controls overlay */}
      {isMobile && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${
            isFullscreen ? (showControls ? "opacity-0 hover:opacity-100" : "opacity-100") : "opacity-100"
          }`}>
          <div className="bg-black/50 px-4 py-2 text-center text-white">
            <div className="text-xs text-gray-300">
              <span className="mx-1">Swipe left/right: Change Preset</span>
              <span className="mx-1">Swipe up/down: {isFullscreen ? "Exit" : "Enter"} Fullscreen</span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop controls */}
      {!isMobile && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 transform space-y-2 text-center transition-opacity duration-300 ${
            isFullscreen ? "opacity-0 hover:opacity-100" : "opacity-100"
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
      )}
    </>
  );
}
