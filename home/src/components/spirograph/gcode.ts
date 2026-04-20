import type { SpirographParams } from "./types";
import { calculatePoints } from "./math";

export interface GCodeResult {
  text: string;
  pointsExported: number;
  pointsTotal: number;
  distanceMm: number;
  estimatedSeconds: number;
  scaleFactor: number;
}

export function generateGCode(params: SpirographParams): GCodeResult {
  const pts = calculatePoints(params);
  if (pts.length === 0) {
    return { text: "", pointsExported: 0, pointsTotal: 0, distanceMm: 0, estimatedSeconds: 0, scaleFactor: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const patternWidth = Math.max(1e-6, maxX - minX);
  const patternHeight = Math.max(1e-6, maxY - minY);
  const availableWidth = params.gcodeWidth - params.gcodeMargin * 2;
  const availableHeight = params.gcodeHeight - params.gcodeMargin * 2;
  const scale = Math.min(availableWidth / patternWidth, availableHeight / patternHeight);

  const centerX = params.gcodeWidth / 2;
  const centerY = params.gcodeHeight / 2;
  const patternCenterX = (minX + maxX) / 2;
  const patternCenterY = (minY + maxY) / 2;

  const transform = (x: number, y: number) => {
    const tx = (x - patternCenterX) * scale + centerX;
    const ty = (y - patternCenterY) * scale + centerY;
    return {
      x: Math.round(tx * 1000) / 1000,
      y: Math.round(ty * 1000) / 1000
    };
  };

  let exportPts = pts;
  if (params.gcodeOptimize && params.gcodePointSkip > 1) {
    const skip = params.gcodePointSkip;
    exportPts = pts.filter((_, i) => i % skip === 0 || i === pts.length - 1);
  }

  const lines: string[] = [];
  lines.push("; Spirograph G-Code");
  lines.push(`; Generated: ${new Date().toISOString()}`);
  lines.push(";");
  lines.push("; Pattern Settings:");
  lines.push(`; Arm 1: R=${params.arm1Radius}, Speed=${params.arm1Speed}`);
  lines.push(`; Arm 2: R=${params.arm2Radius}, Speed=${params.arm2Speed}`);
  if (params.arm3Enabled) lines.push(`; Arm 3: R=${params.arm3Radius}, Speed=${params.arm3Speed}`);
  if (params.arm4Enabled) lines.push(`; Arm 4: R=${params.arm4Radius}, Speed=${params.arm4Speed}`);
  lines.push(`; Rotations: ${params.rotations}`);
  lines.push(";");
  lines.push("; Machine Settings:");
  lines.push(`; Bed Size: ${params.gcodeWidth} x ${params.gcodeHeight} mm`);
  lines.push(`; Feed Rate: ${params.gcodeFeedRate} mm/min`);
  lines.push(`; Travel Speed: ${params.gcodeTravelSpeed} mm/min`);
  lines.push(`; Pen Up Z: ${params.gcodePenUpZ} mm`);
  lines.push(`; Pen Down Z: ${params.gcodePenDownZ} mm`);
  lines.push(`; Scale Factor: ${scale.toFixed(4)}`);
  lines.push(`; Total Points: ${exportPts.length} (from ${pts.length})`);
  lines.push(";");

  lines.push("G21 ; Set units to millimeters");
  lines.push("G90 ; Absolute positioning");
  lines.push(`G1 Z${params.gcodePenUpZ} F${params.gcodeTravelSpeed} ; Pen up`);
  lines.push("");

  const start = transform(exportPts[0].x, exportPts[0].y);
  lines.push("; Move to start position");
  lines.push(`G1 X${start.x} Y${start.y} F${params.gcodeTravelSpeed}`);
  lines.push(`G1 Z${params.gcodePenDownZ} F${params.gcodeFeedRate} ; Pen down`);
  lines.push("");
  lines.push("; Begin drawing spirograph");

  let totalDistance = 0;
  let lastPos = start;
  for (let i = 1; i < exportPts.length; i++) {
    const pos = transform(exportPts[i].x, exportPts[i].y);
    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
    lines.push(`G1 X${pos.x} Y${pos.y}`);
    lastPos = pos;
  }

  lines.push("");
  lines.push(`G1 Z${params.gcodePenUpZ} F${params.gcodeTravelSpeed} ; Pen up`);
  lines.push(`G1 X0 Y0 F${params.gcodeTravelSpeed} ; Return to origin`);
  lines.push("M84 ; Disable steppers (optional)");
  lines.push("");
  lines.push("; Statistics:");
  lines.push(`; Drawing distance: ${Math.round(totalDistance)} mm`);
  const estimatedSeconds = (totalDistance / params.gcodeFeedRate) * 60;
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = Math.round(estimatedSeconds % 60);
  lines.push(`; Estimated draw time: ${minutes}m ${seconds}s`);

  return {
    text: lines.join("\n"),
    pointsExported: exportPts.length,
    pointsTotal: pts.length,
    distanceMm: totalDistance,
    estimatedSeconds,
    scaleFactor: scale
  };
}

export function downloadGCode(params: SpirographParams) {
  const result = generateGCode(params);
  if (!result.text) return result;
  const blob = new Blob([result.text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `spirograph_${Date.now()}.gcode`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return result;
}
