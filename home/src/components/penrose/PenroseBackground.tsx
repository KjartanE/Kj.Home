"use client";

import { memo } from "react";
import PenroseLSystemRenderer from "./PenroseLSystemRenderer";

function PenroseBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <PenroseLSystemRenderer />
    </div>
  );
}

export default memo(PenroseBackground);
