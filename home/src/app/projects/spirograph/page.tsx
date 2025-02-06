"use client";

import { useState } from "react";
import SpirographScene from "@/components/spirograph/SpirographScene";
import { Controls } from "@/components/spirograph/Controls";

export default function Page() {
  const [params, setParams] = useState({
    R: 5,
    r: 3,
    d: 2,
    speed: 1,
    b: 0.5
  });
  
  const [key, setKey] = useState(0);

  const handleRChange = (value: number) => setParams(prev => ({ ...prev, R: value }));
  const handlerChange = (value: number) => setParams(prev => ({ ...prev, r: value }));
  const handleDChange = (value: number) => setParams(prev => ({ ...prev, d: value }));
  const handleSpeedChange = (value: number) => setParams(prev => ({ ...prev, speed: value }));
  const handleBChange = (value: number) => setParams(prev => ({ ...prev, b: value }));
  const handleRender = () => setKey(prev => prev + 1);

  return (
    <div className="fixed inset-0">
      <SpirographScene key={key} params={params} />
      <Controls
        onRChange={handleRChange}
        onrChange={handlerChange}
        onDChange={handleDChange}
        onSpeedChange={handleSpeedChange}
        onBChange={handleBChange}
        onRender={handleRender}
        initialValues={params}
      />
    </div>
  );
}
