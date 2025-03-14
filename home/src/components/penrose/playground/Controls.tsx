"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ControlsProps {
  onGenerationsChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onInstantChange: (value: boolean) => void;
  onRender: () => void;
  initialValues: {
    generations: number;
    speed: number;
    instant: boolean;
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

export function Controls({
  onGenerationsChange,
  onSpeedChange,
  onInstantChange,
  onRender,
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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableCard position={position} isExpanded={isExpanded} setIsExpanded={setIsExpanded} isMobile={isMobile}>
        {isExpanded && (
          <CardContent className={`p-4 ${isMobile ? "max-h-[70vh] overflow-y-auto" : ""}`}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Generations: {values.generations}</Label>
                <Slider
                  value={[values.generations]}
                  min={0}
                  max={8}
                  step={1}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, generations: value }));
                    onGenerationsChange(value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Speed: {values.speed}</Label>
                <Slider
                  value={[values.speed]}
                  min={10}
                  max={1000}
                  step={10}
                  onValueChange={([value]) => {
                    setValues((prev) => ({ ...prev, speed: value }));
                    onSpeedChange(value);
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={values.instant}
                  onCheckedChange={(checked) => {
                    setValues((prev) => ({ ...prev, instant: checked }));
                    onInstantChange(checked);
                  }}
                />
                <Label>Instant Render</Label>
              </div>
              <Button variant="default" className="w-full" onClick={onRender}>
                Render
              </Button>
            </div>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
}
