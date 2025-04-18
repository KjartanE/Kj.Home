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

    this.handleWheel = this.handleWheel.bind(this);
    this.animate = this.animate.bind(this);
  }

  private animate() {
    if (!this.isAnimating) {
      this.animationFrameId = null;
      return;
    }

    const zoomDiff = this.targetZoom - this.currentZoom;
    const centerDiff = new THREE.Vector2().subVectors(this.targetCenter, this.material.uniforms.center.value);

    // Smooth interpolation factors
    const zoomFactor = 0.15;
    const centerFactor = 0.15;

    // Update current values with smooth interpolation
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
  }

  cleanup() {
    this.container.removeEventListener("wheel", this.handleWheel);

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

    // Replace the baseZoomFactor calculation with a constant value
    const baseZoomFactor = 0.15; // Constant zoom factor

    const zoomFactor = event.deltaY > 0 ? 1.0 / (1.0 + baseZoomFactor) : 1.0 + baseZoomFactor;

    const newZoom = this.currentZoom * zoomFactor;

    // Increased zoom range
    if (newZoom >= Number.EPSILON && newZoom <= 1e308) {
      // Using JavaScript's maximum safe number
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

  public zoomIn() {
    const zoomFactor = 1.2;
    this.targetZoom = this.currentZoom * zoomFactor;
    this.startAnimation();
  }

  public zoomOut() {
    const zoomFactor = 1.2;
    this.targetZoom = this.currentZoom / zoomFactor;
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

  private startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }
}
