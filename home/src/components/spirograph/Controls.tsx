"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ControlsProps {
  onRChange: (value: number) => void;
  onrChange: (value: number) => void;
  onDChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onBChange: (value: number) => void;
  onThirdCircleToggle: (value: boolean) => void;
  onThirdRadiusChange: (value: number) => void;
  onRender: () => void;
  initialValues: {
    R: number;
    r: number;
    d: number;
    speed: number;
    b: number;
    thirdCircle: boolean;
    thirdRadius: number;
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
    id: "spirograph-controls"
  });

  const style: React.CSSProperties = isMobile ? {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    opacity: 0.8,
  } : {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 40,
    transform: `translate3d(${position.x + (transform?.x || 0)}px, ${position.y + (transform?.y || 0)}px, 0)`
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${isMobile ? "w-full rounded-b-none backdrop-blur-sm bg-background/80" : "w-80"}`}>
        <div
          {...(isMobile ? {} : { ...attributes, ...listeners })}
          className={`flex h-16 ${!isMobile && "cursor-move"} items-center justify-between px-3 ${isExpanded ? 'border-b' : ''}`}>
          <h3 className="font-semibold">Spirograph Controls</h3>
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
  onRChange,
  onrChange,
  onDChange,
  onSpeedChange,
  onBChange,
  onThirdCircleToggle,
  onThirdRadiusChange,
  onRender,
  initialValues,
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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableCard 
        position={position} 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded}
        isMobile={isMobile}
      >
        {isExpanded && (
          <CardContent className={`p-4 ${isMobile ? "max-h-[70vh] overflow-y-auto" : ""}`}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Outer Circle (R): {values.R}</Label>
                <Slider
                  value={[values.R]}
                  min={Math.max(1, values.r)}
                  max={10}
                  step={1}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, R: value }));
                    onRChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Inner Circle (r): {values.r}</Label>
                <Slider
                  value={[values.r]}
                  min={1}
                  max={values.R}
                  step={1}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, r: value }));
                    onrChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Distance (d): {values.d}</Label>
                <Slider
                  value={[values.d]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, d: value }));
                    onDChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Bounce Vector (b): {values.b}</Label>
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={[values.b]}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, b: value }));
                    onBChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Speed: {values.speed}x</Label>
                <Slider
                  value={[values.speed]}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, speed: value }));
                    onSpeedChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Third Circle</Label>
                  <Switch
                    checked={values.thirdCircle}
                    onCheckedChange={(checked) => {
                      setValues((prev) => ({ ...prev, thirdCircle: checked }));
                      onThirdCircleToggle(checked);
                    }}
                  />
                </div>
                {values.thirdCircle && (
                  <div className="space-y-2 mt-2">
                    <Label>Third Circle Radius: {values.thirdRadius}</Label>
                    <Slider
                      value={[values.thirdRadius]}
                      min={0}
                      max={values.r / values.R * 2}
                      step={0.2}
                      onValueChange={([value]) => {
                        setValues((prev) => ({ ...prev, thirdRadius: value }));
                        onThirdRadiusChange(value);
                      }}
                    />
                  </div>
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={onRender}
              >
                Render New Spirograph
              </Button>
            </div>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
} 