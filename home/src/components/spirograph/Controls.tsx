"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";

interface ControlsProps {
  onRChange: (value: number) => void;
  onrChange: (value: number) => void;
  onDChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onBChange: (value: number) => void;
  onRender: () => void;
  initialValues: {
    R: number;
    r: number;
    d: number;
    speed: number;
    b: number;
  };
}

function DraggableCard({
  children,
  position,
  isExpanded,
  setIsExpanded
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "spirograph-controls"
  });

  const style = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    zIndex: 40,
    transform: `translate3d(${position.x + (transform?.x || 0)}px, ${position.y + (transform?.y || 0)}px, 0)`
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="w-80">
        <div
          {...attributes}
          {...listeners}
          className={`flex h-16 cursor-move items-center justify-between px-3 ${isExpanded ? 'border-b' : ''}`}>
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
  onRender,
  initialValues,
}: ControlsProps) {
  const hasMounted = useHasMounted();
  const [isExpanded, setIsExpanded] = useState(true);
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
      <DraggableCard position={position} isExpanded={isExpanded} setIsExpanded={setIsExpanded}>
        {isExpanded && (
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Outer Circle (R): {values.R}</Label>
                <Slider
                  value={[values.R]}
                  min={1}
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
                  max={10}
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
                  step={0.1}
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