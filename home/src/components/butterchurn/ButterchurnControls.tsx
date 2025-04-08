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
  const lastTapTime = useRef(0);

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

    // Show controls on touch
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
    
    // Check for downward swipe from top (for exiting fullscreen)
    if (isFullscreen && deltaY > 100 && touchStartY.current < 100) {
      document.exitFullscreen();
    }
  };

  // Handle tap to show controls
  const handleTap = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime.current;
    
    if (tapLength < 500 && tapLength > 0) {
      // Double tap detected
      setShowControls(true);
      
      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      
      // Hide controls after 3 seconds
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    lastTapTime.current = currentTime;
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
      <div 
        className="absolute inset-0 z-10" 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      />

      {/* Mobile controls overlay */}
      {isMobile && (
        <>
          {/* Top swipe indicator for fullscreen exit */}
          {isFullscreen && (
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/30 z-30" />
          )}
          
          {/* Sleeker controls */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
              showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}>
            <div className="bg-black/30 backdrop-blur-sm px-4 py-3 text-center text-white">
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={onPreviousPreset}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  aria-label="Previous preset">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                
                <button
                  onClick={onRandomPreset}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  aria-label="Random preset">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                    <path d="M12 22.08V12" />
                  </svg>
                </button>
                
                <button
                  onClick={onNextPreset}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  aria-label="Next preset">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="text-xs text-gray-300 mt-2">
                <span>Swipe left/right: Change Preset</span>
                {isFullscreen && <span className="ml-2">• Swipe down from top: Exit Fullscreen</span>}
              </div>
            </div>
          </div>
        </>
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
