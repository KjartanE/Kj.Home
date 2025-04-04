"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PenroseLSystemRenderer from "../PenroseLSystemRenderer";

function PersistentPenroseBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 -z-10 opacity-30">
      <PenroseLSystemRenderer />
    </div>,
    document.body
  );
}

export default PersistentPenroseBackground; 