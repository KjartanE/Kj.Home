"use client";

import { Button } from "@/components/ui/button";
import { X, Target } from "lucide-react";
import { PLANETS, SUN_FACTS } from "./bodies";
import type { MoonDef, PlanetDef } from "./types";

interface InfoPanelProps {
  bodyName: string | null;
  onClose: () => void;
  onFocus: (name: string) => void;
  onSelect: (name: string) => void;
}

function findBody(
  name: string
): { kind: "sun" } | { kind: "planet"; def: PlanetDef } | { kind: "moon"; def: MoonDef; parent: PlanetDef } | null {
  if (name === "Sun") return { kind: "sun" };
  for (const p of PLANETS) {
    if (p.name === name) return { kind: "planet", def: p };
    const m = p.moons.find((x) => x.name === name);
    if (m) return { kind: "moon", def: m, parent: p };
  }
  return null;
}

function fmtMass(kg: number): string {
  const earth = 5.9722e24;
  if (kg >= 1e26) return `${(kg / 1e24).toFixed(1)} × 10²⁴ kg (${(kg / earth).toFixed(1)}× Earth)`;
  return `${(kg / 1e22).toFixed(1)} × 10²² kg (${(kg / earth).toFixed(3)}× Earth)`;
}

function fmtRotation(hours: number): string {
  const abs = Math.abs(hours);
  const retro = hours < 0 ? " (retrograde)" : "";
  if (abs < 48) return `${abs.toFixed(2)} hours${retro}`;
  return `${(abs / 24).toFixed(2)} days${retro}`;
}

function fmtOrbitalDays(days: number): string {
  if (days < 730) return `${days.toFixed(1)} days`;
  return `${(days / 365.25).toFixed(2)} years`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono tabular-nums">{value}</span>
    </div>
  );
}

export default function InfoPanel({ bodyName, onClose, onFocus, onSelect }: InfoPanelProps) {
  if (!bodyName) return null;
  const body = findBody(bodyName);
  if (!body) return null;

  return (
    <div className="pointer-events-auto absolute left-4 top-20 z-10 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border/40 bg-background/85 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {body.kind === "sun" ? "Star" : body.kind === "planet" ? "Planet" : `Moon of ${body.parent.name}`}
          </div>
          <h3 className="text-lg font-bold leading-tight">{bodyName}</h3>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onFocus(bodyName)}
            title="Focus camera">
            <Target className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose} title="Close">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {body.kind === "sun" && (
        <>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{SUN_FACTS.description}</p>
          <div className="mt-3 border-t border-border/30 pt-2">
            <Row label="Radius" value={`${SUN_FACTS.radiusKm.toLocaleString()} km`} />
            <Row label="Mass" value={fmtMass(SUN_FACTS.massKg)} />
            <Row label="Rotation" value={fmtRotation(SUN_FACTS.rotationHours)} />
          </div>
        </>
      )}

      {body.kind === "planet" && (
        <>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body.def.facts.description}</p>
          <div className="mt-3 border-t border-border/30 pt-2">
            <Row label="Radius" value={`${body.def.facts.radiusKm.toLocaleString()} km`} />
            <Row label="Mass" value={fmtMass(body.def.facts.massKg)} />
            <Row label="Semi-major axis" value={`${body.def.elements.a.toFixed(3)} AU`} />
            <Row label="Eccentricity" value={body.def.elements.e.toFixed(4)} />
            <Row label="Inclination" value={`${body.def.elements.i.toFixed(2)}°`} />
            <Row label="Orbital period" value={fmtOrbitalDays(body.def.facts.orbitalDays)} />
            <Row label="Day length" value={fmtRotation(body.def.facts.rotationHours)} />
            <Row label="Axial tilt" value={`${body.def.facts.tiltDeg.toFixed(1)}°`} />
          </div>
          {body.def.moons.length > 0 && (
            <div className="mt-3 border-t border-border/30 pt-2">
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Moons ({body.def.moons.length})</div>
              <div className="flex flex-wrap gap-1">
                {body.def.moons.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => onSelect(m.name)}
                    className="rounded-md border border-border/40 bg-secondary/40 px-2 py-0.5 text-xs hover:bg-secondary/80">
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {body.kind === "moon" && (
        <>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body.def.facts.description}</p>
          <div className="mt-3 border-t border-border/30 pt-2">
            <Row label="Radius" value={`${body.def.facts.radiusKm.toLocaleString()} km`} />
            <Row label="Distance from parent" value={`${body.def.facts.distanceKm.toLocaleString()} km`} />
            <Row label="Orbital period" value={fmtOrbitalDays(Math.abs(body.def.facts.periodDays))} />
          </div>
          <div className="mt-3 border-t border-border/30 pt-2">
            <button
              onClick={() => onSelect(body.parent.name)}
              className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to {body.parent.name}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
