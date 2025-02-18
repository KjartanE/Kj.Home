// src/components/mandelbrot/NavigationControls.tsx
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface NavigationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMove: (direction: "up" | "down" | "left" | "right") => void;
}

export function NavigationControls({ onZoomIn, onZoomOut, onMove }: NavigationControlsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [zoomInInterval, setZoomInInterval] = useState<NodeJS.Timeout | null>(null);
  const [zoomOutInterval, setZoomOutInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (zoomInInterval) clearInterval(zoomInInterval);
      if (zoomOutInterval) clearInterval(zoomOutInterval);
    };
  }, [zoomInInterval, zoomOutInterval]);

  const handleZoomInStart = () => {
    onZoomIn();
    const interval = setInterval(onZoomIn, 50) as unknown as NodeJS.Timeout;
    setZoomInInterval(interval);
  };

  const handleZoomOutStart = () => {
    onZoomOut(); // Initial zoom
    const interval = setInterval(onZoomOut, 50) as unknown as NodeJS.Timeout;
    setZoomOutInterval(interval);
  };

  const handleZoomInEnd = () => {
    if (zoomInInterval) {
      clearInterval(zoomInInterval);
      setZoomInInterval(null);
    }
  };

  const handleZoomOutEnd = () => {
    if (zoomOutInterval) {
      clearInterval(zoomOutInterval);
      setZoomOutInterval(null);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 flex flex-col items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>

      {isVisible && (
        <>
          <div className="flex gap-2 rounded-md bg-black/50 p-2 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onMouseDown={handleZoomOutStart}
              onMouseUp={handleZoomOutEnd}
              onMouseLeave={handleZoomOutEnd}
              onTouchStart={handleZoomOutStart}
              onTouchEnd={handleZoomOutEnd}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onMouseDown={handleZoomInStart}
              onMouseUp={handleZoomInEnd}
              onMouseLeave={handleZoomInEnd}
              onTouchStart={handleZoomInStart}
              onTouchEnd={handleZoomInEnd}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-md bg-black/50 p-2 backdrop-blur-sm">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => onMove("up")}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => onMove("left")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => onMove("right")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => onMove("down")}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
