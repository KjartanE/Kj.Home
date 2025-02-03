"use client";

import { useTheme } from "next-themes";
import PenroseLSystemRenderer from "./PenroseLSystemRenderer";

export default function PenroseBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <PenroseLSystemRenderer />
    </div>
  );
} 