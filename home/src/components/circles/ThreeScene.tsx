"use client";

import React, { useRef } from "react";

const CirclesScene: React.FC = () => {
  // ===== State =====
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== Render UI =====
  return (
    <div className="relative">
      <div ref={containerRef} className="fixed inset-0" />
    </div>
  );
};

export default CirclesScene;
