"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ControlsProps {
  onGravityChange: (value: number) => void;
  onDampingChange: (value: number) => void;
  onColorChange: (color1: string, color2: string) => void;
  onTracerLengthChange: (value: number) => void;
  onTracerFadeChange: (value: number) => void;
  initialValues: {
    gravity: number;
    damping: number;
    color1: string;
    color2: string;
    tracerLength: number;
    tracerFade: number;
  };
}

function DraggableCard({
  children,
  position,
  isExpanded,
  setIsExpanded,
  isMobile
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isMobile: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "pendulum-controls"
  });

  const style: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        opacity: 0.8
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
      <Card className={`${isMobile ? "w-full rounded-b-none bg-background/80 backdrop-blur-sm" : "w-80"}`}>
        <div
          {...(isMobile ? {} : { ...attributes, ...listeners })}
          className={`flex h-16 ${!isMobile && "cursor-move"} items-center justify-between px-3 ${isExpanded ? "border-b" : ""}`}>
          <h3 className="font-semibold">Pendulum Controls</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            onPointerDown={(e) => e.stopPropagation()}>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function Controls({
  onGravityChange,
  onDampingChange,
  onColorChange,
  onTracerLengthChange,
  onTracerFadeChange,
  initialValues
}: ControlsProps) {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [values, setValues] = useState(initialValues);

  if (!hasMounted) {
    return null;
  }

  const handleDragEnd = (event: any) => {
    if (!event.delta) return;
    setPosition((prev) => ({
      x: prev.x + event.delta.x,
      y: prev.y + event.delta.y
    }));
  };

  const resetToDefaults = () => {
    setValues(initialValues);
    onGravityChange(initialValues.gravity);
    onDampingChange(initialValues.damping);
    onColorChange(initialValues.color1, initialValues.color2);
    onTracerLengthChange(initialValues.tracerLength);
    onTracerFadeChange(initialValues.tracerFade);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableCard position={position} isExpanded={isExpanded} setIsExpanded={setIsExpanded} isMobile={isMobile}>
        {isExpanded && (
          <CardContent className={`p-4 ${isMobile ? "max-h-[70vh] overflow-y-auto" : ""}`}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Gravity: {values.gravity}</Label>
                <Slider
                  value={[values.gravity]}
                  min={100}
                  max={2000}
                  step={10}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, gravity: value }));
                    onGravityChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Damping: {values.damping}</Label>
                <Slider
                  value={[values.damping]}
                  min={0.9}
                  max={1}
                  step={0.001}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, damping: value }));
                    onDampingChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Tracer Length: {values.tracerLength}</Label>
                <Slider
                  value={[values.tracerLength]}
                  min={50}
                  max={1000}
                  step={10}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, tracerLength: value }));
                    onTracerLengthChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Tracer Fade Time (s): {values.tracerFade}</Label>
                <Slider
                  value={[values.tracerFade]}
                  min={1}
                  max={15}
                  step={0.1}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, tracerFade: value }));
                    onTracerFadeChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Tracer Color 1</Label>
                <Input
                  type="color"
                  value={values.color1}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, color1: e.target.value }));
                    onColorChange(e.target.value, values.color2);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Tracer Color 2</Label>
                <Input
                  type="color"
                  value={values.color2}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, color2: e.target.value }));
                    onColorChange(values.color1, e.target.value);
                  }}
                />
              </div>
              <Button variant="default" className="w-full" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
}
