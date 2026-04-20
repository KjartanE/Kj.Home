"use client";

import { useEffect, useRef } from "react";
import { calculatePoints, computeBBox, getActiveArms, lerp, slowInOut, lerpColor, TAU } from "./math";
import type { BBox, Point } from "./math";
import type { SpirographParams } from "./types";

interface SpirographSceneProps {
  params: SpirographParams;
}

const GRADIENT_COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c"];

// Changing any of these invalidates the cached static-mode curve.
const STATIC_RECALC_KEYS: (keyof SpirographParams)[] = [
  "arm1Radius",
  "arm1Speed",
  "arm1Phase",
  "arm2Radius",
  "arm2Speed",
  "arm2Phase",
  "arm3Enabled",
  "arm3Radius",
  "arm3Speed",
  "arm3Phase",
  "arm4Enabled",
  "arm4Radius",
  "arm4Speed",
  "arm4Phase",
  "radialOffset",
  "phaseOffset",
  "scaleOffset",
  "rotations",
  "animationMode"
];

function recalcSig(p: SpirographParams): string {
  return STATIC_RECALC_KEYS.map((k) => String(p[k])).join("|");
}

export default function SpirographScene({ params }: SpirographSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live params — mutable ref so the RAF loop sees the latest without an
  // effect teardown. The effect intentionally has [] deps.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    let points: Point[] = [];
    let bbox: BBox = { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    let lastStaticSig = "";

    // Animation clock. startTime is the "virtual start" adjusted for pause spans.
    let startTime = performance.now();
    let pauseBeganAt: number | null = null;
    let wasPaused = false;

    const resize = () => {
      const nextDpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === width && h === height && nextDpr === dpr) return;
      dpr = nextDpr;
      width = w;
      height = h;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const getAnimProgress = (p: SpirographParams, playhead: number): number => {
      const drawTime = Math.max(0.01, 1 - p.holdAtEnd);
      let progress = playhead < drawTime ? playhead / drawTime : 1;
      if (p.animLoopMode === "Loop") {
        progress = progress % 1;
      } else if (p.animLoopMode === "Ping-Pong") {
        progress = progress % 2;
        if (progress > 1) progress = 2 - progress;
      } else {
        progress = Math.min(progress, 1);
      }
      return progress;
    };

    const computeScale = (): number => {
      const halfW = Math.max(Math.abs(bbox.minX), Math.abs(bbox.maxX), 1);
      const halfH = Math.max(Math.abs(bbox.minY), Math.abs(bbox.maxY), 1);
      const available = Math.min(width, height) * 0.45;
      return Math.min(available / halfW, available / halfH);
    };

    const drawCurve = (p: SpirographParams, scale: number, currentPointIndex: number) => {
      if (currentPointIndex <= 0 || points.length === 0) return;
      ctx.lineWidth = p.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (p.glowEffect) {
        ctx.shadowColor = p.lineColor;
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowBlur = 0;
      }

      if (p.gradientLine) {
        const segmentSize = Math.max(1, Math.floor(currentPointIndex / 800));
        for (let i = 0; i < currentPointIndex; i += segmentSize) {
          const startIdx = i;
          const endIdx = Math.min(i + segmentSize + 1, currentPointIndex);
          if (endIdx - startIdx < 2) continue;
          const sp = i / Math.max(1, points.length - 1);
          const ci = sp * (GRADIENT_COLORS.length - 1);
          const cLower = Math.floor(ci);
          const cUpper = Math.min(cLower + 1, GRADIENT_COLORS.length - 1);
          ctx.strokeStyle = lerpColor(GRADIENT_COLORS[cLower], GRADIENT_COLORS[cUpper], ci - cLower);
          ctx.beginPath();
          ctx.moveTo(points[startIdx].x * scale, points[startIdx].y * scale);
          for (let j = startIdx + 1; j < endIdx; j++) {
            ctx.lineTo(points[j].x * scale, points[j].y * scale);
          }
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = p.lineColor;
        ctx.beginPath();
        ctx.moveTo(points[0].x * scale, points[0].y * scale);
        for (let i = 1; i <= currentPointIndex; i++) {
          ctx.lineTo(points[i].x * scale, points[i].y * scale);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    const drawMechanism = (p: SpirographParams, easedProgress: number, scale: number) => {
      const currentAngle = easedProgress * p.rotations * TAU;
      const rotationNumber = easedProgress * p.rotations;
      const phaseDrift = ((p.phaseOffset * Math.PI) / 180) * rotationNumber;
      const scaleDrift = 1 + p.scaleOffset * rotationNumber;
      const arms = getActiveArms(p);

      ctx.globalAlpha = p.mechanismAlpha;
      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 1.25;

      let armX = 0;
      let armY = 0;
      for (let i = 0; i < arms.length; i++) {
        const arm = arms[i];
        const armAngle = currentAngle * arm.speed + arm.phase + phaseDrift;
        const armRadius = arm.radius * scaleDrift;

        ctx.beginPath();
        ctx.arc(armX * scale, armY * scale, armRadius * scale, 0, TAU);
        ctx.stroke();

        const nextX = armX + armRadius * Math.cos(armAngle);
        const nextY = armY + armRadius * Math.sin(armAngle);

        ctx.beginPath();
        ctx.moveTo(armX * scale, armY * scale);
        ctx.lineTo(nextX * scale, nextY * scale);
        ctx.stroke();

        ctx.fillStyle = "#ff6b6b";
        ctx.beginPath();
        ctx.arc(armX * scale, armY * scale, 3, 0, TAU);
        ctx.fill();

        armX = nextX;
        armY = nextY;
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ff3366";
      ctx.beginPath();
      ctx.arc(armX * scale, armY * scale, 6, 0, TAU);
      ctx.fill();
    };

    const drawProgressBar = (progress: number) => {
      const barWidth = width * 0.3;
      const barHeight = 3;
      const barX = (width - barWidth) / 2;
      const barY = height - 28;
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    };

    const frame = (now: number) => {
      resize();
      const p = paramsRef.current;

      // Pause handling: when pause starts, remember the moment; on resume,
      // shift startTime forward by how long we were paused so the playhead
      // picks up exactly where it left off.
      if (p.paused && !wasPaused) {
        pauseBeganAt = now;
      } else if (!p.paused && wasPaused && pauseBeganAt !== null) {
        startTime += now - pauseBeganAt;
        pauseBeganAt = null;
      }
      wasPaused = p.paused;

      const effectiveNow = p.paused && pauseBeganAt !== null ? pauseBeganAt : now;
      const duration = Math.max(0.1, p.duration) * 1000;
      const playhead = ((effectiveNow - startTime) % duration) / duration;
      const animProgress = getAnimProgress(p, playhead);
      const easedProgress = slowInOut(animProgress, 1.5);

      const mode = p.animationMode;
      const sig = recalcSig(p);

      let drawProgress = 1;
      let showMech = false;
      let animPhase = 0;
      let animOffset = 0;
      let animScale = 0;

      if (mode === "Draw" || mode === "Complete") {
        if (sig !== lastStaticSig) {
          points = calculatePoints(p);
          bbox = computeBBox(points);
          lastStaticSig = sig;
        }
        drawProgress = mode === "Draw" ? easedProgress : 1;
        showMech = mode === "Draw" && p.showMechanism && animProgress < 1;
      } else {
        if (mode === "Animate Phase" || mode === "Animate All") {
          animPhase = lerp(p.animPhaseFrom, p.animPhaseTo, easedProgress) * (180 / Math.PI);
        }
        if (mode === "Animate Offset" || mode === "Animate All") {
          animOffset = lerp(p.animOffsetFrom, p.animOffsetTo, easedProgress);
        }
        if (mode === "Animate Scale" || mode === "Animate All") {
          animScale = lerp(p.animScaleFrom, p.animScaleTo, easedProgress);
        }
        points = calculatePoints(p, animPhase, animOffset, animScale);
        bbox = computeBBox(points);
        lastStaticSig = sig;
        drawProgress = 1;
        showMech = false;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = p.bgColor;
      ctx.fillRect(0, 0, width, height);

      const scale = computeScale();
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);

      const currentPointIndex = Math.floor(drawProgress * (points.length - 1));
      drawCurve(p, scale, currentPointIndex);
      if (showMech) drawMechanism(p, easedProgress, scale);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mode !== "Complete") drawProgressBar(animProgress);

      rafId = requestAnimationFrame(frame);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    rafId = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
