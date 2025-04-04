"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PenroseLSystemRenderer from "../PenroseLSystemRenderer";

function PersistentPenroseBackground() {
  const [mounted, setMounted] = useState(false);

  const whiteList = ["/", "/about", "/projects", "/contact", "/blog"];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!whiteList.includes(window.location.pathname)) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 -z-10 opacity-30">
      <PenroseLSystemRenderer />
    </div>,
    document.body
  );
}

export default PersistentPenroseBackground;
