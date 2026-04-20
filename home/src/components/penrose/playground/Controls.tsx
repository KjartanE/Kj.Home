"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DndContext, useDraggable, type DragEndEvent } from "@dnd-kit/core";
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface KaleidoscopeParams {
  layerCount: number;
  rotationSpeed: number;
  hueSpread: number;
  baseHue: number;
  saturation: number;
  lightness: number;
  deflation: number;
  paused: boolean;
}

interface ControlsProps {
  params: KaleidoscopeParams;
  onChange: <K extends keyof KaleidoscopeParams>(key: K, value: KaleidoscopeParams[K]) => void;
  onReset: () => void;
}

function DraggableCard({
  children,
  position,
  isExpanded,
  setIsExpanded,
  isMobile,
  onReset,
  onTogglePause,
  paused
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isMobile: boolean;
  onReset: () => void;
  onTogglePause: () => void;
  paused: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "penrose-kaleidoscope-controls"
  });

  const style: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        opacity: 0.92
      }
    : {
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        transform: `translate3d(${position.x + (transform?.x || 0)}px, ${position.y + (transform?.y || 0)}px, 0)`
      };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={
          isMobile
            ? "w-full rounded-b-none bg-background/80 backdrop-blur-sm"
            : "w-80 bg-background/80 backdrop-blur-sm"
        }>
        <div
          {...(isMobile ? {} : { ...attributes, ...listeners })}
          className={`flex h-14 ${!isMobile ? "cursor-move" : ""} items-center justify-between px-3 ${isExpanded ? "border-b" : ""}`}>
          <h3 className="font-semibold">Penrose Kaleidoscope</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onTogglePause}
              aria-label={paused ? "Play" : "Pause"}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onReset}
              aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {children}
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
      </div>
      {children}
    </div>
  );
}

export function Controls({ params, onChange, onReset }: ControlsProps) {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: 16, y: 80 });

  if (!hasMounted) {
    return null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.delta) return;
    setPosition((prev) => ({
      x: prev.x + event.delta.x,
      y: prev.y + event.delta.y
    }));
  };

  const togglePause = () => onChange("paused", !params.paused);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableCard
        position={position}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isMobile={isMobile}
        onReset={onReset}
        onTogglePause={togglePause}
        paused={params.paused}>
        {isExpanded && (
          <CardContent className={`space-y-5 p-4 ${isMobile ? "max-h-[70vh] overflow-y-auto" : ""}`}>
            <Row
              label={
                <span>
                  Symmetry order <span className="font-mono text-muted-foreground">{params.layerCount}</span>
                </span>
              }>
              <Slider
                value={[params.layerCount]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => onChange("layerCount", v)}
              />
            </Row>

            <Row
              label={
                <span>
                  Rotation speed{" "}
                  <span className="font-mono text-muted-foreground">{params.rotationSpeed.toFixed(3)}</span>
                </span>
              }>
              <Slider
                value={[params.rotationSpeed]}
                min={0}
                max={0.4}
                step={0.005}
                onValueChange={([v]) => onChange("rotationSpeed", v)}
              />
            </Row>

            <Row
              label={
                <span>
                  Base hue <span className="font-mono text-muted-foreground">{Math.round(params.baseHue * 360)}°</span>
                </span>
              }>
              <Slider
                value={[params.baseHue]}
                min={0}
                max={1}
                step={0.005}
                onValueChange={([v]) => onChange("baseHue", v)}
              />
            </Row>

            <Row
              label={
                <span>
                  Hue spread <span className="font-mono text-muted-foreground">{params.hueSpread.toFixed(2)}</span>
                </span>
              }>
              <Slider
                value={[params.hueSpread]}
                min={0}
                max={1.5}
                step={0.01}
                onValueChange={([v]) => onChange("hueSpread", v)}
              />
            </Row>

            <Row
              label={
                <span>
                  Saturation <span className="font-mono text-muted-foreground">{params.saturation.toFixed(2)}</span>
                </span>
              }>
              <Slider
                value={[params.saturation]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([v]) => onChange("saturation", v)}
              />
            </Row>

            <Row
              label={
                <span>
                  Lightness <span className="font-mono text-muted-foreground">{params.lightness.toFixed(2)}</span>
                </span>
              }>
              <Slider
                value={[params.lightness]}
                min={0.1}
                max={0.9}
                step={0.01}
                onValueChange={([v]) => onChange("lightness", v)}
              />
            </Row>

            <Row
              label={
                <span>
                  Deflation <span className="font-mono text-muted-foreground">{params.deflation}</span>
                </span>
              }>
              <Slider
                value={[params.deflation]}
                min={3}
                max={6}
                step={1}
                onValueChange={([v]) => onChange("deflation", v)}
              />
            </Row>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
}
