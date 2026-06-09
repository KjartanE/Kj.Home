"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

// Project pages are fixed inset-0 canvas layouts; an animated transform
// ancestor would re-root their containing block, so they render bare.
const PROJECT_PAGE = /^\/projects\/[^/]+$/;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (reducedMotion || PROJECT_PAGE.test(pathname)) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
