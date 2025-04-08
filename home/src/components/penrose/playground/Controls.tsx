"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Slider } from "@/components/ui/slider";

interface ControlsProps {
  onRotationChange: (value: number) => void;
  onRotationSpeedChange: (value: number) => void;
  initialValues: {
    rotation: number;
    rotationSpeed: number;
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
    id: "penrose-controls"
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
          <h3 className="font-semibold">Penrose Controls</h3>
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

export function Controls({ onRotationChange, onRotationSpeedChange, initialValues }: ControlsProps) {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [rotation, setRotation] = useState(initialValues.rotation);
  const [rotationSpeed, setRotationSpeed] = useState(initialValues.rotationSpeed);

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
      <DraggableCard position={position} isExpanded={isExpanded} setIsExpanded={setIsExpanded} isMobile={isMobile}>
        {isExpanded && (
          <CardContent className={`p-4 ${isMobile ? "max-h-[70vh] overflow-y-auto" : ""}`}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Rotation: {rotation}</Label>
                <Slider
                  value={[rotation]}
                  min={0}
                  max={Math.PI}
                  step={0.001}
                  onValueChange={([value]) => {
                    setRotation(value);
                    onRotationChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Rotation Speed: {rotationSpeed}</Label>
                <Slider
                  value={[rotationSpeed]}
                  min={0}
                  max={0.001}
                  step={0.0001}
                  onValueChange={([value]) => {
                    setRotationSpeed(value);
                    onRotationSpeedChange(value);
                  }}
                />
              </div>
            </div>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
}
