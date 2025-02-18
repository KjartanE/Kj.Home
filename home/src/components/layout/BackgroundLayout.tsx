"use client";

import { usePathname } from "next/navigation";
import PenroseBackground from "@/components/penrose/PenroseBackground";
import { memo } from "react";

const excludedPaths = [
  "/projects/chladni",
  "/projects/penrose",
  "/projects/cube",
  "/projects/pendulum",
  "/projects/solar",
  "/projects/mandelbrot",
  "/projects/spirograph",
  "/projects/waveform",
  "/projects/butterchurn"
];

function BackgroundLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBackground = !excludedPaths.some((path) => pathname.startsWith(path));

  return (
    <>
      {showBackground && <PenroseBackground />}
      {children}
    </>
  );
}

export default memo(BackgroundLayout);
