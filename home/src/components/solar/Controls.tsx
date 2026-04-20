"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pause, Play, Rewind } from "lucide-react";
import { format } from "date-fns";

interface ControlsProps {
  simDate: Date;
  epoch: Date;
  onEpochChange: (d: Date) => void;
  daysPerSecond: number;
  onDaysPerSecondChange: (v: number) => void;
  paused: boolean;
  onPausedChange: (v: boolean) => void;
  showOrbits: boolean;
  onShowOrbitsChange: (v: boolean) => void;
}

function formatDaysPerSecond(d: number): string {
  if (d === 0) return "Paused";
  if (d < 1) return `${(d * 24).toFixed(1)} h/s`;
  if (d < 30) return `${d.toFixed(1)} d/s`;
  if (d < 365) return `${(d / 30).toFixed(1)} mo/s`;
  return `${(d / 365.25).toFixed(1)} yr/s`;
}

export default function Controls({
  simDate,
  epoch,
  onEpochChange,
  daysPerSecond,
  onDaysPerSecondChange,
  paused,
  onPausedChange,
  showOrbits,
  onShowOrbitsChange
}: ControlsProps) {
  const dateForInput = format(epoch, "yyyy-MM-dd");

  return (
    <div className="pointer-events-auto absolute right-4 top-20 z-10 flex w-72 flex-col gap-3 rounded-xl border border-border/40 bg-background/80 p-4 shadow-lg backdrop-blur-md">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simulation Date</div>
        <div className="mt-1 font-mono text-sm tabular-nums">{format(simDate, "yyyy-MM-dd HH:mm 'UTC'")}</div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="solar-epoch" className="text-xs">
          Set date
        </Label>
        <div className="flex gap-1.5">
          <Input
            id="solar-epoch"
            type="date"
            value={dateForInput}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(e) => {
              const next = new Date(`${e.target.value}T00:00:00Z`);
              if (!Number.isNaN(next.getTime())) onEpochChange(next);
            }}
            className="h-8 text-xs"
          />
          <Button size="sm" variant="secondary" onClick={() => onEpochChange(new Date())} title="Jump to today">
            Today
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Speed</Label>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatDaysPerSecond(paused ? 0 : daysPerSecond)}
          </span>
        </div>
        <Slider
          value={[daysPerSecond]}
          min={0}
          max={365}
          step={0.1}
          onValueChange={([v]) => onDaysPerSecondChange(v)}
        />
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1"
            onClick={() => onPausedChange(!paused)}
            title={paused ? "Resume" : "Pause"}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span className="ml-1 text-xs">{paused ? "Play" : "Pause"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1"
            onClick={() => onEpochChange(new Date(epoch.getTime() - 86400000 * 30))}
            title="Rewind 30 days">
            <Rewind className="h-3 w-3" />
            <span className="ml-1 text-xs">−30d</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="solar-orbits" className="text-xs">
          Show orbits
        </Label>
        <Switch id="solar-orbits" checked={showOrbits} onCheckedChange={onShowOrbitsChange} />
      </div>
    </div>
  );
}
