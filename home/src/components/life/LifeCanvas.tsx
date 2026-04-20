"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Life, PATTERNS, type Pattern, unpackKey } from "./engine";
import { ChevronDown, Pause, Play, RotateCcw, SkipForward, Shuffle, Trash2, X } from "lucide-react";

const MIN_PPC = 1; // min pixels per cell
const MAX_PPC = 60;
const DEFAULT_PPC = 14;
const DRAG_THRESHOLD = 3; // px before a press becomes a drag
const GRID_LINE_THRESHOLD = 7; // show grid lines when ppc >= this

const COLOR_BG = "#0b0f0b";
const COLOR_GRID = "#1f241f";
const COLOR_GRID_MAJOR = "#2a332a";
const COLOR_CELL = "#22c55e";
const COLOR_GHOST = "rgba(34, 197, 94, 0.35)";
const COLOR_ORIGIN = "#3a4a3a";

type Camera = { cx: number; cy: number; ppc: number };
type DragMode = "none" | "pan" | "paint" | "erase";

export default function LifeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lifeRef = useRef<Life>(new Life());
  const camRef = useRef<Camera>({ cx: 0, cy: 0, ppc: DEFAULT_PPC });
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const armedPatternRef = useRef<Pattern | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(10); // updates per second
  const [armedPattern, setArmedPattern] = useState<Pattern | null>(null);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [zoom, setZoom] = useState(DEFAULT_PPC);

  // Keep refs in sync with state
  useEffect(() => {
    armedPatternRef.current = armedPattern;
  }, [armedPattern]);

  const isRunningRef = useRef(isRunning);
  const speedRef = useRef(speed);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Group patterns by category for the menu
  const patternGroups = useMemo(() => {
    const groups = new Map<string, Pattern[]>();
    for (const p of PATTERNS) {
      if (!groups.has(p.category)) groups.set(p.category, []);
      groups.get(p.category)!.push(p);
    }
    return Array.from(groups.entries());
  }, []);

  // Main effect: canvas setup, rendering, input
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const life = lifeRef.current;
    const cam = camRef.current;

    // Logical (CSS) dimensions — populated on resize
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    // Initial randomize within the viewport
    {
      const halfW = Math.ceil(cssW / 2 / cam.ppc);
      const halfH = Math.ceil(cssH / 2 / cam.ppc);
      life.randomize(-halfW, -halfH, halfW, halfH, 0.3);
      setGeneration(0);
      setPopulation(life.population);
    }

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize);

    // ---- Input handling ----
    let pointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragMode: DragMode = "none";
    let lastPaintCell: { x: number; y: number } | null = null;

    const screenToGrid = (sx: number, sy: number): { gx: number; gy: number } => ({
      gx: Math.floor((sx - cssW / 2) / cam.ppc + cam.cx),
      gy: Math.floor((sy - cssH / 2) / cam.ppc + cam.cy)
    });

    const stampPatternAt = (gx: number, gy: number, pattern: Pattern) => {
      const ax = gx - Math.floor(pattern.width / 2);
      const ay = gy - Math.floor(pattern.height / 2);
      life.stamp(pattern, ax, ay);
      setPopulation(life.population);
    };

    const paintLine = (fromX: number, fromY: number, toX: number, toY: number, erase: boolean) => {
      // Bresenham between grid cells
      let x0 = fromX;
      let y0 = fromY;
      const x1 = toX;
      const y1 = toY;
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        life.set(x0, y0, !erase);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x0 += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y0 += sy;
        }
      }
      setPopulation(life.population);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return;
      const rect = canvas.getBoundingClientRect();
      pointerDown = true;
      pointerStartX = e.clientX - rect.left;
      pointerStartY = e.clientY - rect.top;
      lastPointerX = pointerStartX;
      lastPointerY = pointerStartY;
      dragMode = "none";
      lastPaintCell = null;
      canvas.setPointerCapture(e.pointerId);

      // Right-click → immediately start panning (or erasing with shift)
      if (e.button === 2) {
        dragMode = e.shiftKey ? "erase" : "pan";
        if (dragMode === "erase") {
          const { gx, gy } = screenToGrid(pointerStartX, pointerStartY);
          life.set(gx, gy, false);
          lastPaintCell = { x: gx, y: gy };
          setPopulation(life.population);
        }
      }
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Always update cursor for ghost preview
      const { gx, gy } = screenToGrid(x, y);
      cursorRef.current = { x: gx, y: gy };

      if (!pointerDown) return;

      const dx = x - lastPointerX;
      const dy = y - lastPointerY;

      if (dragMode === "none") {
        const totalDx = x - pointerStartX;
        const totalDy = y - pointerStartY;
        if (Math.hypot(totalDx, totalDy) > DRAG_THRESHOLD) {
          if (e.shiftKey) {
            dragMode = "paint";
            const start = screenToGrid(pointerStartX, pointerStartY);
            life.set(start.gx, start.gy, true);
            lastPaintCell = { x: start.gx, y: start.gy };
            setPopulation(life.population);
          } else {
            dragMode = "pan";
          }
        }
      }

      if (dragMode === "pan") {
        cam.cx -= dx / cam.ppc;
        cam.cy -= dy / cam.ppc;
      } else if (dragMode === "paint" || dragMode === "erase") {
        const erase = dragMode === "erase";
        if (!lastPaintCell) {
          life.set(gx, gy, !erase);
          setPopulation(life.population);
        } else if (lastPaintCell.x !== gx || lastPaintCell.y !== gy) {
          paintLine(lastPaintCell.x, lastPaintCell.y, gx, gy, erase);
        }
        lastPaintCell = { x: gx, y: gy };
      }

      lastPointerX = x;
      lastPointerY = y;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDown) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (dragMode === "none") {
        const { gx, gy } = screenToGrid(x, y);
        const pat = armedPatternRef.current;
        if (pat && e.button === 0) {
          stampPatternAt(gx, gy, pat);
        } else if (e.button === 0) {
          life.toggle(gx, gy);
          setPopulation(life.population);
        }
      }

      pointerDown = false;
      dragMode = "none";
      lastPaintCell = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    const onPointerLeave = () => {
      cursorRef.current = null;
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Grid point under cursor before zoom
      const gxBefore = (mx - cssW / 2) / cam.ppc + cam.cx;
      const gyBefore = (my - cssH / 2) / cam.ppc + cam.cy;

      const factor = Math.exp(-e.deltaY * 0.0015);
      const newPpc = Math.min(MAX_PPC, Math.max(MIN_PPC, cam.ppc * factor));

      // Keep cursor's grid point fixed after zoom
      cam.cx = gxBefore - (mx - cssW / 2) / newPpc;
      cam.cy = gyBefore - (my - cssH / 2) / newPpc;
      cam.ppc = newPpc;
      setZoom(newPpc);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // ---- Render + animation loop ----
    let rafId = 0;
    let lastStepTime = performance.now();

    const render = () => {
      const W = cssW;
      const H = cssH;
      const ppc = cam.ppc;

      // Background
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, W, H);

      // Visible grid range (with 1-cell padding)
      const xMin = Math.floor(-W / 2 / ppc + cam.cx) - 1;
      const xMax = Math.ceil(W / 2 / ppc + cam.cx) + 1;
      const yMin = Math.floor(-H / 2 / ppc + cam.cy) - 1;
      const yMax = Math.ceil(H / 2 / ppc + cam.cy) + 1;

      // Grid lines
      if (ppc >= GRID_LINE_THRESHOLD) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = COLOR_GRID;
        ctx.beginPath();
        for (let x = xMin; x <= xMax; x++) {
          if (x % 10 === 0) continue;
          const sx = Math.round((x - cam.cx) * ppc + W / 2) + 0.5;
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, H);
        }
        for (let y = yMin; y <= yMax; y++) {
          if (y % 10 === 0) continue;
          const sy = Math.round((y - cam.cy) * ppc + H / 2) + 0.5;
          ctx.moveTo(0, sy);
          ctx.lineTo(W, sy);
        }
        ctx.stroke();

        // Major lines every 10 cells
        ctx.strokeStyle = COLOR_GRID_MAJOR;
        ctx.beginPath();
        for (let x = xMin; x <= xMax; x++) {
          if (x % 10 !== 0) continue;
          const sx = Math.round((x - cam.cx) * ppc + W / 2) + 0.5;
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, H);
        }
        for (let y = yMin; y <= yMax; y++) {
          if (y % 10 !== 0) continue;
          const sy = Math.round((y - cam.cy) * ppc + H / 2) + 0.5;
          ctx.moveTo(0, sy);
          ctx.lineTo(W, sy);
        }
        ctx.stroke();
      }

      // Origin marker (tiny cross) when visible
      const originSx = (0 - cam.cx) * ppc + W / 2;
      const originSy = (0 - cam.cy) * ppc + H / 2;
      if (originSx >= 0 && originSx <= W && originSy >= 0 && originSy <= H) {
        ctx.strokeStyle = COLOR_ORIGIN;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(originSx - 6, originSy + 0.5);
        ctx.lineTo(originSx + 6, originSy + 0.5);
        ctx.moveTo(originSx + 0.5, originSy - 6);
        ctx.lineTo(originSx + 0.5, originSy + 6);
        ctx.stroke();
      }

      // Live cells
      ctx.fillStyle = COLOR_CELL;
      const size = Math.max(1, ppc - (ppc >= GRID_LINE_THRESHOLD ? 1 : 0));
      for (const key of life.alive) {
        const [x, y] = unpackKey(key);
        if (x < xMin || x > xMax || y < yMin || y > yMax) continue;
        const sx = (x - cam.cx) * ppc + W / 2;
        const sy = (y - cam.cy) * ppc + H / 2;
        ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(size), Math.ceil(size));
      }

      // Ghost preview for armed pattern
      const pat = armedPatternRef.current;
      const cursor = cursorRef.current;
      if (pat && cursor) {
        ctx.fillStyle = COLOR_GHOST;
        const ax = cursor.x - Math.floor(pat.width / 2);
        const ay = cursor.y - Math.floor(pat.height / 2);
        for (const [dx, dy] of pat.cells) {
          const x = ax + dx;
          const y = ay + dy;
          const sx = (x - cam.cx) * ppc + W / 2;
          const sy = (y - cam.cy) * ppc + H / 2;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(size), Math.ceil(size));
        }
      }
    };

    const loop = (ts: number) => {
      if (isRunningRef.current) {
        const interval = 1000 / speedRef.current;
        // Catch up but cap per-frame steps to avoid runaway
        let steps = 0;
        while (ts - lastStepTime >= interval && steps < 5) {
          life.step();
          lastStepTime += interval;
          steps++;
        }
        if (steps > 0) {
          setGeneration(life.generation);
          setPopulation(life.population);
        }
      } else {
        lastStepTime = ts;
      }
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Controls
  const toggleRun = useCallback(() => setIsRunning((r) => !r), []);

  const step = useCallback(() => {
    if (isRunningRef.current) return;
    const life = lifeRef.current;
    life.step();
    setGeneration(life.generation);
    setPopulation(life.population);
  }, []);

  const clear = useCallback(() => {
    const life = lifeRef.current;
    life.clear();
    setGeneration(0);
    setPopulation(0);
    setIsRunning(false);
  }, []);

  const randomizeViewport = useCallback(() => {
    const life = lifeRef.current;
    const cam = camRef.current;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const halfW = Math.ceil(rect.width / 2 / cam.ppc);
    const halfH = Math.ceil(rect.height / 2 / cam.ppc);
    life.randomize(
      Math.floor(cam.cx) - halfW,
      Math.floor(cam.cy) - halfH,
      Math.floor(cam.cx) + halfW,
      Math.floor(cam.cy) + halfH,
      0.3
    );
    setGeneration(0);
    setPopulation(life.population);
  }, []);

  const recenter = useCallback(() => {
    camRef.current.cx = 0;
    camRef.current.cy = 0;
    camRef.current.ppc = DEFAULT_PPC;
    setZoom(DEFAULT_PPC);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip when typing in inputs
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.code === "Space") {
        e.preventDefault();
        toggleRun();
      } else if (e.key === "s" || e.key === "S") {
        step();
      } else if (e.key === "c" || e.key === "C") {
        clear();
      } else if (e.key === "r" || e.key === "R") {
        randomizeViewport();
      } else if (e.key === "Escape") {
        setArmedPattern(null);
      } else if (e.key === "Home") {
        recenter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleRun, step, clear, randomizeViewport, recenter]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 touch-none ${armedPattern ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
      />

      {/* Stats — top-left */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-md">
        <div>gen {generation.toLocaleString()}</div>
        <div>pop {population.toLocaleString()}</div>
        <div>zoom {zoom.toFixed(1)}×</div>
      </div>

      {/* Pattern picker — top-right */}
      <div className="absolute right-4 top-20 z-10 flex items-center gap-2">
        {armedPattern && (
          <div className="flex items-center gap-1 rounded-xl border border-primary/40 bg-background/70 px-3 py-1.5 text-xs backdrop-blur-md">
            <span className="font-mono">{armedPattern.name}</span>
            <button
              onClick={() => setArmedPattern(null)}
              className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Cancel pattern">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="bg-background/70 backdrop-blur-md">
              Patterns <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
            {patternGroups.map(([category, patterns], i) => (
              <div key={category}>
                {i > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {category}
                </DropdownMenuLabel>
                {patterns.map((p) => (
                  <DropdownMenuItem
                    key={p.name}
                    onSelect={() => setArmedPattern(p)}
                    className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{p.name}</span>
                    {p.description && <span className="text-xs text-muted-foreground">{p.description}</span>}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Controls — bottom-center */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border/40 bg-background/70 p-3 backdrop-blur-md">
        <Button
          size="sm"
          variant={isRunning ? "secondary" : "default"}
          onClick={toggleRun}
          aria-label={isRunning ? "Pause" : "Play"}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={step} disabled={isRunning} aria-label="Step">
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={clear} aria-label="Clear">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={randomizeViewport} aria-label="Randomize">
          <Shuffle className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={recenter} aria-label="Recenter">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{speed} gen/s</span>
          <Slider value={[speed]} min={1} max={60} step={1} onValueChange={(v) => setSpeed(v[0])} className="w-28" />
        </div>
      </div>

      {/* Hint — bottom-left (tiny) */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-lg border border-border/40 bg-background/60 px-3 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-md">
        drag · pan shift+drag · paint wheel · zoom space · play s · step
      </div>
    </div>
  );
}
