"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ControlsProps {
  onValueChange: (key: string, value: number | string) => void;
  initialValues: {
    a: number;
    b: number;
    n: number;
    m: number;
    opacityOne: number;
    opacityTwo: number;
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
    id: "controls"
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
          <h3 className="font-semibold">Pattern Controls</h3>
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

export function Controls({ onValueChange, initialValues }: ControlsProps) {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [sliderValues, setSliderValues] = useState(initialValues);

  useEffect(() => {
    setSliderValues(initialValues);
  }, [initialValues]);

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

  const handleReset = () => {
    const defaultValues = {
      a: 100,
      b: 100,
      n: 3,
      m: 5,
      opacityOne: 1,
      opacityTwo: 1
    };

    Object.entries(defaultValues).forEach(([key, value]) => {
      onValueChange(key, value);
    });
    onValueChange("colorOne", "#ffffff");
    onValueChange("colorTwo", "#ffffff");
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
                <Label>A Value: {sliderValues.a}</Label>
                <Slider
                  value={[sliderValues.a]}
                  min={-100}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => {
                    setSliderValues((prev) => ({ ...prev, a: value }));
                    onValueChange("a", value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>B Value: {sliderValues.b}</Label>
                <Slider
                  value={[sliderValues.b]}
                  min={-100}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => {
                    setSliderValues((prev) => ({ ...prev, b: value }));
                    onValueChange("b", value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>N Value: {sliderValues.n}</Label>
                <Slider
                  value={[sliderValues.n]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => {
                    setSliderValues((prev) => ({ ...prev, n: value }));
                    onValueChange("n", value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>M Value: {sliderValues.m}</Label>
                <Slider
                  value={[sliderValues.m]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => {
                    setSliderValues((prev) => ({ ...prev, m: value }));
                    onValueChange("m", value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Opacity One: {sliderValues.opacityOne}</Label>
                <Slider
                  value={[sliderValues.opacityOne]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => {
                    setSliderValues((prev) => ({ ...prev, opacityOne: value }));
                    onValueChange("opacityOne", value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Opacity Two: {sliderValues.opacityTwo}</Label>
                <Slider
                  value={[sliderValues.opacityTwo]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => {
                    setSliderValues((prev) => ({ ...prev, opacityTwo: value }));
                    onValueChange("opacityTwo", value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Color One</Label>
                <Input
                  type="color"
                  className="h-10 w-full cursor-pointer"
                  onChange={(e) => onValueChange("colorOne", e.target.value)}
                  defaultValue="#ffffff"
                />
              </div>
              <div className="space-y-2">
                <Label>Color Two</Label>
                <Input
                  type="color"
                  className="h-10 w-full cursor-pointer"
                  onChange={(e) => onValueChange("colorTwo", e.target.value)}
                  defaultValue="#ffffff"
                />
              </div>
              <Button className="w-full" variant="default" onClick={handleReset}>
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
}
