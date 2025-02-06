"use client";

import { usePathname } from "next/navigation";
import PenroseBackground from "@/components/penrose/PenroseBackground";
import { memo, useMemo } from "react";

const excludedPaths = [
  "/projects/chladni",
  "/projects/penrose",
  "/projects/cube",
  "/projects/pendulum",
  "/projects/solar"
];

function BackgroundLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Memoize the showBackground calculation
  const showBackground = useMemo(() => {
    return !excludedPaths.some(path => pathname.startsWith(path));
  }, [pathname]);

  return (
    <>
      {showBackground && <PenroseBackground />}
      {children}
    </>
  );
}

export default memo(BackgroundLayout); 