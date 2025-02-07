"use client";

interface ZoomIndicatorProps {
  zoom: number;
}

export function ZoomIndicator({ zoom }: ZoomIndicatorProps) {
  // Format zoom level to be more readable
  const formatZoom = (zoom: number) => {
    if (zoom >= 1) {
      return `${zoom.toFixed(2)}x`;
    } else {
      return `${(1/zoom).toFixed(2)}x out`;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/50 text-white px-3 py-2 rounded-md backdrop-blur-sm text-sm">
      Zoom: {formatZoom(zoom)}
    </div>
  );
} 