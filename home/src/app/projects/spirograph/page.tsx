"use client";

import { useState } from "react";
import SpirographScene from "@/components/spirograph/SpirographScene";
import { Controls } from "@/components/spirograph/Controls";

export default function Page() {
  const [params, setParams] = useState({
    R: 5,
    r: 3,
    d: 2,
    speed: 2,
    b: 1,
    thirdCircle: false,
    thirdRadius: 1
  });
  
  const [key, setKey] = useState(0);

  const handleRChange = (value: number) => {
    // When R changes, ensure r stays smaller than R
    setParams(prev => ({
      ...prev,
      R: value,
      r: Math.min(prev.r, value)
    }));
  };

  const handlerChange = (value: number) => {
    // Ensure r is not larger than R
    const newR = Math.min(value, params.R);
    setParams(prev => ({ ...prev, r: newR }));
  };

  const handleDChange = (value: number) => setParams(prev => ({ ...prev, d: value }));
  const handleSpeedChange = (value: number) => setParams(prev => ({ ...prev, speed: value }));
  const handleBChange = (value: number) => setParams(prev => ({ ...prev, b: value }));
  const handleThirdCircleToggle = (value: boolean) => setParams(prev => ({ ...prev, thirdCircle: value }));
  const handleThirdRadiusChange = (value: number) => {
    // Ensure third circle radius is not larger than second circle
    const maxRadius = params.r / params.R; // Normalize to the second circle's size
    const constrainedValue = Math.min(value, maxRadius);
    setParams(prev => ({ ...prev, thirdRadius: constrainedValue }));
  };
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
        onThirdCircleToggle={handleThirdCircleToggle}
        onThirdRadiusChange={handleThirdRadiusChange}
        onRender={handleRender}
        initialValues={params}
      />
    </div>
  );
}
