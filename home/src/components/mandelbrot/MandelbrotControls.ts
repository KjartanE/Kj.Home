import * as THREE from "three";

export class MandelbrotControls {
  private isDragging: boolean;
  private lastMousePos: { x: number; y: number };
  private currentZoom: number;
  private material: THREE.ShaderMaterial;
  private container: HTMLElement;
  private aspect: number;

  constructor(material: THREE.ShaderMaterial, container: HTMLElement, aspect: number) {
    this.isDragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.currentZoom = 1.0;
    this.material = material;
    this.container = container;
    this.aspect = aspect;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
  }

  init() {
    this.container.addEventListener("wheel", this.handleWheel);
    this.container.addEventListener("mousedown", this.handleMouseDown);
    this.container.addEventListener("mousemove", this.handleMouseMove);
    this.container.addEventListener("mouseup", this.handleMouseUp);
    this.container.addEventListener("mouseleave", this.handleMouseUp);
  }

  cleanup() {
    this.container.removeEventListener("wheel", this.handleWheel);
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    this.container.removeEventListener("mousemove", this.handleMouseMove);
    this.container.removeEventListener("mouseup", this.handleMouseUp);
    this.container.removeEventListener("mouseleave", this.handleMouseUp);
  }

  private handleMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.lastMousePos = {
      x: event.clientX,
      y: event.clientY
    };
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.lastMousePos.x;
    const dy = event.clientY - this.lastMousePos.y;

    // Convert screen pixels to Mandelbrot coordinate space
    const scaleFactor = 2.0 / (this.currentZoom * window.innerWidth);
    const moveX = -dx * scaleFactor;
    const moveY = dy * scaleFactor;

    this.material.uniforms.center.value.x += moveX;
    this.material.uniforms.center.value.y += moveY;

    this.lastMousePos = {
      x: event.clientX,
      y: event.clientY
    };
  }

  private handleMouseUp() {
    this.isDragging = false;
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();
    
    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const mandelbrotX = (x * 2.0) / this.currentZoom + this.material.uniforms.center.value.x;
    const mandelbrotY = (y * 2.0 / this.aspect) / this.currentZoom + this.material.uniforms.center.value.y;
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.currentZoom * zoomFactor;
    
    const newCenterX = mandelbrotX - (x * 2.0) / newZoom;
    const newCenterY = mandelbrotY - (y * 2.0 / this.aspect) / newZoom;
    
    this.currentZoom = newZoom;
    this.material.uniforms.zoom.value = this.currentZoom;
    this.material.uniforms.center.value.set(newCenterX, newCenterY);
  }
} 