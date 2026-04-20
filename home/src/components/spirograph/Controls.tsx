"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { AnimationMode, LoopMode, SpirographParams } from "./types";
import { BUILT_IN_PRESETS } from "./presets";
import type { SavedPresets } from "./storage";

interface ControlsProps {
  params: SpirographParams;
  onChange: <K extends keyof SpirographParams>(key: K, value: SpirographParams[K]) => void;
  savedPresets: SavedPresets;
  onLoadPreset: (name: string) => void;
  onSavePreset: () => void;
  onDeletePreset: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onExportGCode: () => void;
}

const ANIMATION_MODES: AnimationMode[] = [
  "Draw",
  "Complete",
  "Animate Phase",
  "Animate Offset",
  "Animate Scale",
  "Animate All"
];

const LOOP_MODES: LoopMode[] = ["Once", "Loop", "Ping-Pong"];

function NumSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const display = format
    ? format(value)
    : step >= 1
      ? Math.round(value).toString()
      : step >= 0.1
        ? value.toFixed(1)
        : step >= 0.01
          ? value.toFixed(2)
          : value.toFixed(4);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{display}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function BoolRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs">{label}</Label>
      <Input
        type="color"
        className="h-8 w-14 cursor-pointer p-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Controls({
  params,
  onChange,
  savedPresets,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  onExportJSON,
  onImportJSON,
  onExportGCode
}: ControlsProps) {
  const hasMounted = useHasMounted();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(true);

  const presetNames = useMemo(
    () => ({
      builtIn: Object.keys(BUILT_IN_PRESETS),
      saved: Object.keys(savedPresets)
    }),
    [savedPresets]
  );

  if (!hasMounted) return null;

  const togglePause = () => onChange("paused", !params.paused);

  const wrapperStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        maxHeight: "60vh"
      }
    : {
        position: "fixed",
        top: 64,
        right: 16,
        zIndex: 40,
        width: 340,
        maxHeight: "calc(100vh - 96px)"
      };

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: isMobile ? undefined : 64,
          right: 16,
          bottom: isMobile ? 16 : undefined,
          zIndex: 40
        }}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Controls
      </Button>
    );
  }

  return (
    <div style={wrapperStyle}>
      <Card
        className={`flex flex-col overflow-hidden bg-background/90 backdrop-blur-sm ${isMobile ? "rounded-b-none" : ""}`}
        style={{ maxHeight: "inherit" }}>
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Spirograph</h3>
            <Button size="sm" variant="ghost" onClick={togglePause} className="h-7 px-2">
              {params.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 px-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto px-3 pb-3 pt-2">
          <Accordion type="multiple" defaultValue={["presets", "animation", "arms"]} className="w-full">
            <AccordionItem value="presets">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">
                Presets
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <Select onValueChange={(v) => v && onLoadPreset(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Load preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {presetNames.builtIn.map((name) => (
                      <SelectItem key={`b-${name}`} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    {presetNames.saved.length > 0 && (
                      <>
                        <div className="mt-1 border-t pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <div className="px-2 py-1">Saved</div>
                        </div>
                        {presetNames.saved.map((name) => (
                          <SelectItem key={`s-${name}`} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={onSavePreset}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={onDeletePreset}>
                    Delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={onExportJSON}>
                    Copy JSON
                  </Button>
                  <Button size="sm" variant="outline" onClick={onImportJSON}>
                    Paste JSON
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="animation">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">
                Animation
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs">Mode</Label>
                  <Select
                    value={params.animationMode}
                    onValueChange={(v) => onChange("animationMode", v as AnimationMode)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANIMATION_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Loop</Label>
                  <Select value={params.animLoopMode} onValueChange={(v) => onChange("animLoopMode", v as LoopMode)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOOP_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <NumSlider
                  label="Hold at end"
                  value={params.holdAtEnd}
                  min={0}
                  max={0.5}
                  step={0.01}
                  onChange={(v) => onChange("holdAtEnd", v)}
                />
                <NumSlider
                  label="Duration (s)"
                  value={params.duration}
                  min={1}
                  max={60}
                  step={1}
                  onChange={(v) => onChange("duration", v)}
                />
                <NumSlider
                  label="Rotations"
                  value={params.rotations}
                  min={1}
                  max={100}
                  step={1}
                  onChange={(v) => onChange("rotations", v)}
                />
              </AccordionContent>
            </AccordionItem>

            {(params.animationMode === "Animate Phase" ||
              params.animationMode === "Animate Offset" ||
              params.animationMode === "Animate Scale" ||
              params.animationMode === "Animate All") && (
              <AccordionItem value="anim-ranges">
                <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">
                  Animation Ranges
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-1">
                  <NumSlider
                    label="Phase from"
                    value={params.animPhaseFrom}
                    min={0}
                    max={Math.PI * 2}
                    step={0.001}
                    onChange={(v) => onChange("animPhaseFrom", v)}
                  />
                  <NumSlider
                    label="Phase to"
                    value={params.animPhaseTo}
                    min={0}
                    max={Math.PI * 2}
                    step={0.001}
                    onChange={(v) => onChange("animPhaseTo", v)}
                  />
                  <NumSlider
                    label="Offset from"
                    value={params.animOffsetFrom}
                    min={-50}
                    max={50}
                    step={0.1}
                    onChange={(v) => onChange("animOffsetFrom", v)}
                  />
                  <NumSlider
                    label="Offset to"
                    value={params.animOffsetTo}
                    min={-50}
                    max={50}
                    step={0.1}
                    onChange={(v) => onChange("animOffsetTo", v)}
                  />
                  <NumSlider
                    label="Scale from"
                    value={params.animScaleFrom}
                    min={-0.1}
                    max={0.1}
                    step={0.0001}
                    onChange={(v) => onChange("animScaleFrom", v)}
                  />
                  <NumSlider
                    label="Scale to"
                    value={params.animScaleTo}
                    min={-0.1}
                    max={0.1}
                    step={0.0001}
                    onChange={(v) => onChange("animScaleTo", v)}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="arms">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">Arms</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-1">
                <div className="space-y-2 rounded-md border p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Arm 1 (base)
                  </div>
                  <NumSlider
                    label="Radius"
                    value={params.arm1Radius}
                    min={1}
                    max={600}
                    step={1}
                    onChange={(v) => onChange("arm1Radius", v)}
                  />
                  <NumSlider
                    label="Speed"
                    value={params.arm1Speed}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={(v) => onChange("arm1Speed", v)}
                  />
                  <NumSlider
                    label="Phase"
                    value={params.arm1Phase}
                    min={-Math.PI * 2}
                    max={Math.PI * 2}
                    step={0.01}
                    onChange={(v) => onChange("arm1Phase", v)}
                  />
                </div>

                <div className="space-y-2 rounded-md border p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Arm 2</div>
                  <NumSlider
                    label="Radius"
                    value={params.arm2Radius}
                    min={1}
                    max={500}
                    step={1}
                    onChange={(v) => onChange("arm2Radius", v)}
                  />
                  <NumSlider
                    label="Speed"
                    value={params.arm2Speed}
                    min={-80}
                    max={80}
                    step={1}
                    onChange={(v) => onChange("arm2Speed", v)}
                  />
                  <NumSlider
                    label="Phase"
                    value={params.arm2Phase}
                    min={-Math.PI * 2}
                    max={Math.PI * 2}
                    step={0.01}
                    onChange={(v) => onChange("arm2Phase", v)}
                  />
                </div>

                <div className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Arm 3
                    </div>
                    <Switch checked={params.arm3Enabled} onCheckedChange={(v) => onChange("arm3Enabled", v)} />
                  </div>
                  {params.arm3Enabled && (
                    <>
                      <NumSlider
                        label="Radius"
                        value={params.arm3Radius}
                        min={1}
                        max={400}
                        step={1}
                        onChange={(v) => onChange("arm3Radius", v)}
                      />
                      <NumSlider
                        label="Speed"
                        value={params.arm3Speed}
                        min={-100}
                        max={100}
                        step={1}
                        onChange={(v) => onChange("arm3Speed", v)}
                      />
                      <NumSlider
                        label="Phase"
                        value={params.arm3Phase}
                        min={-Math.PI * 2}
                        max={Math.PI * 2}
                        step={0.01}
                        onChange={(v) => onChange("arm3Phase", v)}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Arm 4
                    </div>
                    <Switch checked={params.arm4Enabled} onCheckedChange={(v) => onChange("arm4Enabled", v)} />
                  </div>
                  {params.arm4Enabled && (
                    <>
                      <NumSlider
                        label="Radius"
                        value={params.arm4Radius}
                        min={1}
                        max={300}
                        step={1}
                        onChange={(v) => onChange("arm4Radius", v)}
                      />
                      <NumSlider
                        label="Speed"
                        value={params.arm4Speed}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(v) => onChange("arm4Speed", v)}
                      />
                      <NumSlider
                        label="Phase"
                        value={params.arm4Phase}
                        min={-Math.PI * 2}
                        max={Math.PI * 2}
                        step={0.01}
                        onChange={(v) => onChange("arm4Phase", v)}
                      />
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="drift">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">
                Static drift
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <NumSlider
                  label="Radial drift / rev"
                  value={params.radialOffset}
                  min={-50}
                  max={50}
                  step={0.1}
                  onChange={(v) => onChange("radialOffset", v)}
                />
                <NumSlider
                  label="Phase drift / rev (°)"
                  value={params.phaseOffset}
                  min={-90}
                  max={90}
                  step={0.1}
                  onChange={(v) => onChange("phaseOffset", v)}
                />
                <NumSlider
                  label="Scale drift / rev"
                  value={params.scaleOffset}
                  min={-0.1}
                  max={0.1}
                  step={0.0001}
                  onChange={(v) => onChange("scaleOffset", v)}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="visual">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">
                Visual
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <NumSlider
                  label="Line width"
                  value={params.lineWidth}
                  min={0.1}
                  max={20}
                  step={0.1}
                  onChange={(v) => onChange("lineWidth", v)}
                />
                <ColorRow label="Line color" value={params.lineColor} onChange={(v) => onChange("lineColor", v)} />
                <ColorRow label="Background" value={params.bgColor} onChange={(v) => onChange("bgColor", v)} />
                <BoolRow
                  label="Show mechanism"
                  value={params.showMechanism}
                  onChange={(v) => onChange("showMechanism", v)}
                />
                <NumSlider
                  label="Mechanism alpha"
                  value={params.mechanismAlpha}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => onChange("mechanismAlpha", v)}
                />
                <BoolRow
                  label="Gradient line"
                  value={params.gradientLine}
                  onChange={(v) => onChange("gradientLine", v)}
                />
                <BoolRow label="Glow effect" value={params.glowEffect} onChange={(v) => onChange("glowEffect", v)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="gcode">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider">
                G-Code export
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <NumSlider
                  label="Bed width (mm)"
                  value={params.gcodeWidth}
                  min={50}
                  max={500}
                  step={1}
                  onChange={(v) => onChange("gcodeWidth", v)}
                />
                <NumSlider
                  label="Bed height (mm)"
                  value={params.gcodeHeight}
                  min={50}
                  max={500}
                  step={1}
                  onChange={(v) => onChange("gcodeHeight", v)}
                />
                <NumSlider
                  label="Feed rate"
                  value={params.gcodeFeedRate}
                  min={100}
                  max={5000}
                  step={50}
                  onChange={(v) => onChange("gcodeFeedRate", v)}
                />
                <NumSlider
                  label="Travel speed"
                  value={params.gcodeTravelSpeed}
                  min={500}
                  max={10000}
                  step={100}
                  onChange={(v) => onChange("gcodeTravelSpeed", v)}
                />
                <NumSlider
                  label="Pen up Z"
                  value={params.gcodePenUpZ}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={(v) => onChange("gcodePenUpZ", v)}
                />
                <NumSlider
                  label="Pen down Z"
                  value={params.gcodePenDownZ}
                  min={-2}
                  max={5}
                  step={0.1}
                  onChange={(v) => onChange("gcodePenDownZ", v)}
                />
                <NumSlider
                  label="Margin (mm)"
                  value={params.gcodeMargin}
                  min={0}
                  max={50}
                  step={1}
                  onChange={(v) => onChange("gcodeMargin", v)}
                />
                <BoolRow
                  label="Optimize points"
                  value={params.gcodeOptimize}
                  onChange={(v) => onChange("gcodeOptimize", v)}
                />
                <NumSlider
                  label="Point skip"
                  value={params.gcodePointSkip}
                  min={1}
                  max={20}
                  step={1}
                  onChange={(v) => onChange("gcodePointSkip", v)}
                />
                <Button size="sm" className="w-full" onClick={onExportGCode}>
                  Download .gcode
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Card>
    </div>
  );
}
