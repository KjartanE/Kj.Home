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
  private isTouching: boolean;
  private lastTouchDistance: number;
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
    this.isTouching = false;
    this.lastTouchDistance = 0;

    this.handleWheel = this.handleWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.animate = this.animate.bind(this);
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touches: TouchList): { x: number, y: number } {
    const rect = this.container.getBoundingClientRect();
    const centerX = (touches[0].clientX + touches[1].clientX) / 2;
    const centerY = (touches[0].clientY + touches[1].clientY) / 2;
    
    const x = ((centerX - rect.left) / rect.width) * 2 - 1;
    const y = -((centerY - rect.top) / rect.height) * 2 + 1;
    
    return { x, y };
  }

  private handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      event.preventDefault();
      this.isTouching = true;
      this.lastTouchDistance = this.getTouchDistance(event.touches);
    }
  }

  private handleTouchMove(event: TouchEvent) {
    if (!this.isTouching || event.touches.length !== 2) return;
    event.preventDefault();

    const newDistance = this.getTouchDistance(event.touches);
    const touchCenter = this.getTouchCenter(event.touches);
    
    const zoomFactor = newDistance / this.lastTouchDistance;
    this.lastTouchDistance = newDistance;

    const mandelbrotX = (touchCenter.x * 2.0) / this.currentZoom + this.material.uniforms.center.value.x;
    const mandelbrotY = (touchCenter.y * 2.0 / this.aspect) / this.currentZoom + this.material.uniforms.center.value.y;
    
    const newZoom = this.currentZoom * zoomFactor;
    
    if (newZoom >= Number.EPSILON && newZoom <= 1e308) {
      const newCenterX = mandelbrotX - (touchCenter.x * 2.0) / newZoom;
      const newCenterY = mandelbrotY - (touchCenter.y * 2.0 / this.aspect) / newZoom;
      
      this.targetZoom = newZoom;
      this.targetCenter.set(newCenterX, newCenterY);
      
      if (!this.isAnimating) {
        this.isAnimating = true;
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
    }
  }

  private handleTouchEnd() {
    this.isTouching = false;
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
    this.container.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    this.container.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    this.container.addEventListener("touchend", this.handleTouchEnd);
  }

  cleanup() {
    this.container.removeEventListener("wheel", this.handleWheel);
    this.container.removeEventListener("touchstart", this.handleTouchStart);
    this.container.removeEventListener("touchmove", this.handleTouchMove);
    this.container.removeEventListener("touchend", this.handleTouchEnd);
    
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
    const mandelbrotY = (y * 2.0 / this.aspect) / this.currentZoom + this.material.uniforms.center.value.y;
    
    // Replace the baseZoomFactor calculation with a constant value
    const baseZoomFactor = 0.15; // Constant zoom factor

    const zoomFactor = event.deltaY > 0 
      ? 1.0 / (1.0 + baseZoomFactor)
      : 1.0 + baseZoomFactor;
    
    const newZoom = this.currentZoom * zoomFactor;
    
    // Increased zoom range
    if (newZoom >= Number.EPSILON && newZoom <= 1e308) {  // Using JavaScript's maximum safe number
      const newCenterX = mandelbrotX - (x * 2.0) / newZoom;
      const newCenterY = mandelbrotY - (y * 2.0 / this.aspect) / newZoom;
      
      this.targetZoom = newZoom;
      this.targetCenter.set(newCenterX, newCenterY);
      
      if (!this.isAnimating) {
        this.isAnimating = true;
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
    }
  }
} 