import * as THREE from "three";

export class MandelbrotControls {
  private currentZoom: number;
  private targetZoom: number;
  private targetCenter: THREE.Vector2;
  private material: THREE.ShaderMaterial;
  private container: HTMLElement;
  private aspect: number;
  private animationFrameId: number | null;
  private isAnimating: boolean;
  private isDragging: boolean;
  private lastMousePos: { x: number; y: number };
  public onZoomChange?: (zoom: number) => void;

  constructor(material: THREE.ShaderMaterial, container: HTMLElement, aspect: number) {
    this.currentZoom = 1.0;
    this.targetZoom = 1.0;
    this.targetCenter = new THREE.Vector2(0.0, 0.0);
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

  private animate() {
    if (!this.isAnimating) {
      this.animationFrameId = null;
      return;
    }

    const zoomDiff = this.targetZoom - this.currentZoom;
    const centerDiff = new THREE.Vector2().subVectors(this.targetCenter, this.material.uniforms.center.value);

    const zoomFactor = 0.15;
    const centerFactor = 0.15;

    if (Math.abs(zoomDiff) > 1e-10 || centerDiff.length() > 1e-10) {
      this.currentZoom += zoomDiff * zoomFactor;
      this.material.uniforms.zoom.value = this.currentZoom;
      this.onZoomChange?.(this.currentZoom);

      this.material.uniforms.center.value.add(centerDiff.multiplyScalar(centerFactor));

      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.isAnimating = false;
      this.animationFrameId = null;
    }
  }

  init() {
    this.container.addEventListener("wheel", this.handleWheel);
    this.container.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  cleanup() {
    this.container.removeEventListener("wheel", this.handleWheel);
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();

    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const mandelbrotX = (x * 2.0) / this.currentZoom + this.material.uniforms.center.value.x;
    const mandelbrotY = (y * 2.0) / this.aspect / this.currentZoom + this.material.uniforms.center.value.y;

    const baseZoomFactor = 0.15;
    const zoomFactor = event.deltaY > 0 ? 1.0 / (1.0 + baseZoomFactor) : 1.0 + baseZoomFactor;
    const newZoom = this.currentZoom * zoomFactor;

    if (newZoom >= Number.EPSILON && newZoom <= 1e14) {
      const newCenterX = mandelbrotX - (x * 2.0) / newZoom;
      const newCenterY = mandelbrotY - (y * 2.0) / this.aspect / newZoom;

      this.targetZoom = newZoom;
      this.targetCenter.set(newCenterX, newCenterY);

      if (!this.isAnimating) {
        this.isAnimating = true;
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
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

    // Convert pixel delta to Mandelbrot coordinate delta
    const scale = 4.0 / (this.currentZoom * this.container.clientWidth);
    const center = this.material.uniforms.center.value as THREE.Vector2;
    center.x -= dx * scale;
    center.y += dy * scale;
    this.targetCenter.copy(center);
  }

  private handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.container.style.cursor = "crosshair";
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Don't fire when user is typing in an input
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
    this.targetZoom = this.currentZoom * 1.2;
    this.startAnimation();
  }

  public zoomOut() {
    this.targetZoom = this.currentZoom / 1.2;
    this.startAnimation();
  }

  public move(direction: "up" | "down" | "left" | "right") {
    const moveAmount = 0.5 / this.currentZoom;
    const currentCenter = this.material.uniforms.center.value;

    switch (direction) {
      case "up":
        this.targetCenter.set(currentCenter.x, currentCenter.y + moveAmount);
        break;
      case "down":
        this.targetCenter.set(currentCenter.x, currentCenter.y - moveAmount);
        break;
      case "left":
        this.targetCenter.set(currentCenter.x - moveAmount, currentCenter.y);
        break;
      case "right":
        this.targetCenter.set(currentCenter.x + moveAmount, currentCenter.y);
        break;
    }

    this.startAnimation();
  }

  public reset() {
    this.targetZoom = 1.0;
    this.targetCenter.set(0.0, 0.0);
    this.startAnimation();
  }

  private startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }
}
