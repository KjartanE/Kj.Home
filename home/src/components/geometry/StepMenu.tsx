"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Step {
  index: number;
  name: string;
  parentCategory?: string;
}

interface StepMenuProps {
  currentStep: number;
  goToStep: (stepIndex: number) => void;
  parentCategories: string[];
  expandedSubCategories: Record<string, boolean>;
  toggleSubCategory: (category: string) => void;
  getMainSteps: () => Step[];
  getStepsByParentCategory: (category: string) => Step[];
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
    id: "step-menu"
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
      <Card className={`${isMobile ? "w-full rounded-b-none bg-background/80 backdrop-blur-sm" : "w-64"}`}>
        <div
          {...(isMobile ? {} : { ...attributes, ...listeners })}
          className={`flex h-16 ${!isMobile && "cursor-move"} items-center justify-between px-3 ${isExpanded ? "border-b" : ""}`}>
          <h3 className="font-semibold">Available Steps</h3>
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

export function StepMenu({
  currentStep,
  goToStep,
  parentCategories,
  expandedSubCategories,
  toggleSubCategory,
  getMainSteps,
  getStepsByParentCategory
}: StepMenuProps) {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 80 });

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
            <div className="w-full">
              <ul className="space-y-1">
                {/* Main steps (without parent category) */}
                {getMainSteps().map((step) => (
                  <li key={step.index}>
                    <div>
                      <div className="flex items-start justify-between">
                        <button
                          className={`w-full rounded px-3 py-1 text-left ${
                            currentStep === step.index ? "bg-blue-600 font-bold" : "hover:bg-gray-700"
                          }`}
                          onClick={() => goToStep(step.index)}>
                          <span>
                            {step.index + 1}. {step.name}
                          </span>
                        </button>

                        {/* If this step has sub-categories, show a dropdown */}
                        {parentCategories.includes(step.name) && (
                          <div className="">
                            <button
                              className={`flex transform items-center justify-center rounded px-3 py-1 text-sm transition-transform duration-200 ${
                                expandedSubCategories[step.name] ? "rotate-180 bg-gray-700" : "rotate-0"
                              }`}
                              onClick={() => toggleSubCategory(step.name)}>
                              <span>{expandedSubCategories[step.name] ? "▼" : "▶"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Sub-categories */}
                      {expandedSubCategories[step.name] && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-gray-600 pl-2">
                          {getStepsByParentCategory(step.name).map((subStep) => (
                            <button
                              key={subStep.index}
                              className={`w-full rounded px-3 py-1 text-left ${
                                currentStep === subStep.index ? "bg-blue-600 font-bold" : "hover:bg-gray-700"
                              }`}
                              onClick={() => goToStep(subStep.index)}>
                              {subStep.index + 1}. {subStep.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center p-4">
              <p>Use ← → arrow keys to navigate between steps</p>
            </div>
          </CardContent>
        )}
      </DraggableCard>
    </DndContext>
  );
} 