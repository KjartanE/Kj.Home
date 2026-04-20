"use client";

import { useCallback, useRef, useState } from "react";
import SolarScene from "./SolarScene";
import Controls from "./Controls";
import InfoPanel from "./InfoPanel";

export default function SolarBackground() {
  const [epoch, setEpoch] = useState<Date>(() => new Date());
  const [simDate, setSimDate] = useState<Date>(() => new Date());
  const [daysPerSecond, setDaysPerSecond] = useState(5);
  const [paused, setPaused] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  // simDate updates at 60Hz via the scene — throttle via a ref+rAF so React doesn't
  // re-render every frame. We snapshot it once per ~4 frames.
  const lastSimUpdate = useRef(0);
  const onTimeChange = useCallback((d: Date) => {
    const now = performance.now();
    if (now - lastSimUpdate.current > 120) {
      lastSimUpdate.current = now;
      setSimDate(d);
    }
  }, []);

  const onSelect = useCallback((name: string | null) => {
    setSelected(name);
    if (name) setFocused(name);
    else setFocused(null);
  }, []);

  const shownBody = selected ?? hovered;

  return (
    <div className="relative h-full w-full">
      <SolarScene
        epoch={epoch}
        daysPerSecond={daysPerSecond}
        paused={paused}
        showOrbits={showOrbits}
        focusedBody={focused}
        onHover={setHovered}
        onSelect={onSelect}
        onTimeChange={onTimeChange}
      />
      <Controls
        simDate={simDate}
        epoch={epoch}
        onEpochChange={setEpoch}
        daysPerSecond={daysPerSecond}
        onDaysPerSecondChange={setDaysPerSecond}
        paused={paused}
        onPausedChange={setPaused}
        showOrbits={showOrbits}
        onShowOrbitsChange={setShowOrbits}
      />
      <InfoPanel
        bodyName={shownBody}
        onClose={() => {
          setSelected(null);
          setFocused(null);
        }}
        onFocus={setFocused}
        onSelect={(name) => {
          setSelected(name);
          setFocused(name);
        }}
      />
    </div>
  );
}
