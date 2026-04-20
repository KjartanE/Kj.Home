import * as THREE from "three";
import { type DD, ddAdd, ddSub, ddMulFloat, ddFrom, ddToQS, toDS, findNearbyMinibrot } from "./computeOrbit";

export const MAX_ITER = 65536;
export const ITER_SCALE = 300;
export const ITER_FLOOR = 512;

/** Iteration budget for a given zoom level. */
export function iterationBudget(zoom: number): number {
  const log2Zoom = Math.log2(Math.max(zoom, 1));
  return Math.min(MAX_ITER, Math.max(ITER_FLOOR, Math.ceil(ITER_SCALE * log2Zoom + ITER_FLOOR)));
}

export class MandelbrotControls {
  private currentZoom: number;
  private targetZoom: number;
  private centerX: DD;
  private centerY: DD;
  private targetCenterX: DD;
  private targetCenterY: DD;

  private material: THREE.ShaderMaterial;
  private container: HTMLElement;
  private aspect: number;
  private animationFrameId: number | null;
  private isAnimating: boolean;
  private isDragging: boolean;
  private lastMousePos: { x: number; y: number };

  private orbitCenterX: DD;
  private orbitCenterY: DD;
  private orbitZoom: number;
  private orbitIter: number;

  public onZoomChange?: (zoom: number) => void;
  public onOrbitUpdate?: (cx: DD, cy: DD, targetIter: number) => void;

  constructor(material: THREE.ShaderMaterial, container: HTMLElement, aspect: number) {
    this.currentZoom = 1.0;
    this.targetZoom = 1.0;
    this.centerX = ddFrom(0);
    this.centerY = ddFrom(0);
    this.targetCenterX = ddFrom(0);
    this.targetCenterY = ddFrom(0);
    this.orbitCenterX = ddFrom(0);
    this.orbitCenterY = ddFrom(0);
    this.orbitZoom = 1.0;
    this.orbitIter = ITER_FLOOR;
    this.material = material;
    this.container = container;
    this.aspect = aspect;
    this.animationFrameId = null;
    this.isAnimating = false;
    this.isDragging = false;
    this.lastMousePos = { x: 0, y: 0 };

    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.animate = this.animate.bind(this);
  }

  private updateUniforms() {
    const cxQS = ddToQS(this.centerX);
    const cyQS = ddToQS(this.centerY);
    this.material.uniforms.center0.value.set(cxQS[0], cyQS[0]);
    this.material.uniforms.center1.value.set(cxQS[1], cyQS[1]);
    this.material.uniforms.center2.value.set(cxQS[2], cyQS[2]);
    this.material.uniforms.center3.value.set(cxQS[3], cyQS[3]);

    const scale = 2.0 / this.currentZoom;
    const [sHi, sLo] = toDS(scale);
    this.material.uniforms.scaleHi.value = sHi;
    this.material.uniforms.scaleLo.value = sLo;
    this.material.uniforms.zoom.value = this.currentZoom;
  }

  private isOrbitStale(): boolean {
    const pixelSize = 2.0 / this.currentZoom;
    const dx = Math.abs(this.centerX[0] - this.orbitCenterX[0]) + Math.abs(this.centerX[1] - this.orbitCenterX[1]);
    const dy = Math.abs(this.centerY[0] - this.orbitCenterY[0]) + Math.abs(this.centerY[1] - this.orbitCenterY[1]);
    const zoomRatio = Math.max(this.currentZoom / this.orbitZoom, this.orbitZoom / this.currentZoom);
    // Also recompute when the needed iteration budget outgrew the cached orbit
    // by a noticeable margin — otherwise deep zoom starves on a short orbit.
    const neededIter = iterationBudget(this.currentZoom);
    const iterGrew = neededIter > this.orbitIter * 1.25;
    return dx > pixelSize * 200 || dy > pixelSize * 200 || zoomRatio > 4.0 || iterGrew;
  }

  public triggerOrbitUpdate() {
    const targetIter = iterationBudget(this.currentZoom);

    // Try to snap the orbit centre to a nearby minibrot. This never moves
    // the view, only the perturbation reference — so the user's vantage
    // stays put while the orbit gets a non-escaping anchor and BLA picks
    // up larger validity radii. If no suitable minibrot is found (shallow
    // zoom, orbit escapes, Newton diverges) the seek returns null and we
    // fall back to the view centre. Costs only a few DD iterations more
    // than the orbit itself.
    const seek = findNearbyMinibrot(this.centerX, this.centerY, this.currentZoom, targetIter);
    if (seek !== null) {
      this.orbitCenterX = seek.cx;
      this.orbitCenterY = seek.cy;
    } else {
      this.orbitCenterX = [...this.centerX];
      this.orbitCenterY = [...this.centerY];
    }
    this.orbitZoom = this.currentZoom;
    this.orbitIter = targetIter;
    this.onOrbitUpdate?.(this.orbitCenterX, this.orbitCenterY, this.orbitIter);
  }

  private animate() {
    if (!this.isAnimating) {
      this.animationFrameId = null;
      return;
    }

    const factor = 0.15;
    const logCurrent = Math.log(this.currentZoom);
    const logTarget = Math.log(this.targetZoom);
    const logDiff = logTarget - logCurrent;

    const dCX = ddSub(this.targetCenterX, this.centerX);
    const dCY = ddSub(this.targetCenterY, this.centerY);

    // Converge when within ~0.1 pixel of target
    const pixelThreshold = 2.0 / (this.currentZoom * 1000);
    const converged =
      Math.abs(logDiff) < 1e-8 &&
      Math.abs(dCX[0]) + Math.abs(dCX[1]) < pixelThreshold &&
      Math.abs(dCY[0]) + Math.abs(dCY[1]) < pixelThreshold;

    if (!converged) {
      this.currentZoom = Math.exp(logCurrent + logDiff * factor);
      this.centerX = ddAdd(this.centerX, ddMulFloat(dCX, factor));
      this.centerY = ddAdd(this.centerY, ddMulFloat(dCY, factor));
      this.updateUniforms();
      this.onZoomChange?.(this.currentZoom);
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.currentZoom = this.targetZoom;
      this.centerX = [...this.targetCenterX];
      this.centerY = [...this.targetCenterY];
      this.updateUniforms();
      this.onZoomChange?.(this.currentZoom);
      this.isAnimating = false;
      this.animationFrameId = null;
      // Only recompute orbit after animation settles to avoid mid-zoom pops
      if (this.isOrbitStale()) {
        this.triggerOrbitUpdate();
      }
    }
  }

  init() {
    this.container.addEventListener("wheel", this.handleWheel, { passive: false });
    this.container.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);
    this.updateUniforms();
  }

  cleanup() {
    this.container.removeEventListener("wheel", this.handleWheel);
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();

    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const baseZoom = this.targetZoom;

    // Cursor position in Mandelbrot space using DD center
    const mandelbrotX = ddAdd(this.targetCenterX, ddFrom((x * 2.0) / baseZoom));
    const mandelbrotY = ddAdd(this.targetCenterY, ddFrom((y * 2.0) / this.aspect / baseZoom));

    const zoomFactor = event.deltaY > 0 ? 1.0 / 1.15 : 1.15;
    const newZoom = baseZoom * zoomFactor;

    if (newZoom >= Number.EPSILON && newZoom <= 1e28) {
      this.targetZoom = newZoom;
      this.targetCenterX = ddSub(mandelbrotX, ddFrom((x * 2.0) / newZoom));
      this.targetCenterY = ddSub(mandelbrotY, ddFrom((y * 2.0) / this.aspect / newZoom));
      this.startAnimation();
    }
  }

  private handleMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;
    this.isDragging = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    this.container.style.cursor = "grabbing";
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.lastMousePos.x;
    const dy = event.clientY - this.lastMousePos.y;
    this.lastMousePos = { x: event.clientX, y: event.clientY };

    const scale = 4.0 / (this.currentZoom * this.container.clientWidth);
    this.centerX = ddSub(this.centerX, ddFrom(dx * scale));
    this.centerY = ddAdd(this.centerY, ddFrom(dy * scale));
    this.targetCenterX = [...this.centerX];
    this.targetCenterY = [...this.centerY];
    this.updateUniforms();
  }

  private handleMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.container.style.cursor = "crosshair";
    if (this.isOrbitStale()) {
      this.triggerOrbitUpdate();
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    switch (event.key) {
      case "=":
      case "+":
        this.zoomIn();
        break;
      case "-":
        this.zoomOut();
        break;
      case "ArrowUp":
        event.preventDefault();
        this.move("up");
        break;
      case "ArrowDown":
        event.preventDefault();
        this.move("down");
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.move("left");
        break;
      case "ArrowRight":
        event.preventDefault();
        this.move("right");
        break;
      case "r":
      case "R":
        this.reset();
        break;
    }
  }

  public zoomIn() {
    this.targetZoom = Math.min(this.targetZoom * 1.2, 1e28);
    this.startAnimation();
  }
  public zoomOut() {
    this.targetZoom = Math.max(this.targetZoom / 1.2, Number.EPSILON);
    this.startAnimation();
  }

  public move(direction: "up" | "down" | "left" | "right") {
    const amt = 0.5 / this.currentZoom;
    switch (direction) {
      case "up":
        this.targetCenterY = ddAdd(this.centerY, ddFrom(amt));
        break;
      case "down":
        this.targetCenterY = ddSub(this.centerY, ddFrom(amt));
        break;
      case "left":
        this.targetCenterX = ddSub(this.centerX, ddFrom(amt));
        break;
      case "right":
        this.targetCenterX = ddAdd(this.centerX, ddFrom(amt));
        break;
    }
    this.startAnimation();
  }

  public reset() {
    this.targetZoom = 1.0;
    this.targetCenterX = ddFrom(0);
    this.targetCenterY = ddFrom(0);
    this.startAnimation();
  }

  private startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }
}
