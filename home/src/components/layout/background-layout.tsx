"use client";

import PenroseLSystemRenderer from "../penrose/PenroseLSystemRenderer";


export function BackgroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PenroseLSystemRenderer />
      <div className="relative z-20">{children}</div>
    </>
  );
} 