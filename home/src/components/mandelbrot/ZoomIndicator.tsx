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
      return `${(1 / zoom).toFixed(2)}x out`;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 rounded-md bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-sm">
      Zoom: {formatZoom(zoom)}
    </div>
  );
}
