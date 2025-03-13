import * as THREE from "three";

export interface GeometryOptions {
  color?: THREE.ColorRepresentation;
  lineWidth?: number;
  animationDuration?: number; // in seconds
  strokeColor?: THREE.ColorRepresentation; // for outlined shapes
  fillColor?: THREE.ColorRepresentation; // for filled shapes
  opacity?: number;
  segments?: number; // for circles
}

export interface Point {
  x: number;
  y: number;
  z?: number;
}

const DEFAULT_OPTIONS: GeometryOptions = {
  color: 0x00ff00,
  lineWidth: 2,
  animationDuration: 1.5,
  strokeColor: 0x00ff00,
  fillColor: 0x00ff00,
  opacity: 1,
  segments: 64,
};

export class Geometry {
  private parent: THREE.Object3D;
  private clock: THREE.Clock;
  private geometries: THREE.Object3D[] = [];
  private animationStates: Map<THREE.Object3D, { 
    startTime: number; 
    duration: number; 
    completed: boolean;
    update: (progress: number) => void;
  }> = new Map();

  constructor(parent: THREE.Scene | THREE.Group) {
    this.parent = parent;
    this.clock = new THREE.Clock();
  }

  /**
   * Creates an animated line between two points
   */
  createLine(start: Point, end: Point, options: GeometryOptions = {}): THREE.Line {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Create a line geometry with just the start point initially (for animation)
    const points = [
      new THREE.Vector3(start.x, start.y, start.z || 0),
      new THREE.Vector3(start.x, start.y, start.z || 0), // Will be animated to end position
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: opts.color,
      linewidth: opts.lineWidth,
      opacity: opts.opacity,
      transparent: opts.opacity !== undefined && opts.opacity < 1,
    });
    
    const line = new THREE.Line(geometry, material);
    this.parent.add(line);
    this.geometries.push(line);
    
    // Set up animation
    const endVector = new THREE.Vector3(end.x, end.y, end.z || 0);
    const startTime = this.clock.getElapsedTime();
    
    this.animationStates.set(line, {
      startTime,
      duration: opts.animationDuration || 1,
      completed: false,
      update: (progress: number) => {
        if (progress >= 1) return;
        
        // Update the second point position based on progress
        const positions = (geometry.attributes.position as THREE.BufferAttribute).array;
        const lerpedPoint = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(start.x, start.y, start.z || 0),
          endVector,
          progress
        );
        
        // Update the second point (index 3, 4, 5 in the array)
        positions[3] = lerpedPoint.x;
        positions[4] = lerpedPoint.y;
        positions[5] = lerpedPoint.z;
        
        geometry.attributes.position.needsUpdate = true;
      }
    });
    
    return line;
  }

  /**
   * Creates an animated circle
   */
  createCircle(center: Point, radius: number, options: GeometryOptions = {}): THREE.Line {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Create a circle in the X-Z plane instead of X-Y
    const segments = opts.segments || 64;
    const points: THREE.Vector3[] = [];
    
    // Initial points with radius 0 (for animation)
    for (let i = 0; i <= segments; i++) {
      // No need for theta here since all points start at center
      points.push(new THREE.Vector3(
        center.x,
        center.y,
        center.z || 0
      ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: opts.strokeColor,
      linewidth: opts.lineWidth,
      opacity: opts.opacity,
      transparent: opts.opacity !== undefined && opts.opacity < 1,
    });
    
    const circle = new THREE.Line(geometry, material);
    this.parent.add(circle);
    this.geometries.push(circle);
    
    // Set up animation
    const startTime = this.clock.getElapsedTime();
    
    this.animationStates.set(circle, {
      startTime,
      duration: opts.animationDuration || 1,
      completed: false,
      update: (progress: number) => {
        if (progress >= 1) return;
        
        // Update the circle by recreating points with current radius
        const currentRadius = radius * progress;
        const positions = (geometry.attributes.position as THREE.BufferAttribute).array;
        
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          
          // Calculate position on X-Z plane (not X-Y)
          const x = center.x + Math.cos(theta) * currentRadius;
          const z = (center.z || 0) + Math.sin(theta) * currentRadius;
          
          positions[i * 3] = x;
          positions[i * 3 + 1] = center.y; // Keep Y constant
          positions[i * 3 + 2] = z;
        }
        
        geometry.attributes.position.needsUpdate = true;
      }
    });
    
    return circle;
  }

  /**
   * Creates an animated rectangle
   */
  createRectangle(point1: Point, point2: Point, options: GeometryOptions = {}): THREE.Line {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Initial points (just the first corner)
    const points = [
      new THREE.Vector3(point1.x, point1.y, point1.z),
      new THREE.Vector3(point1.x, point1.y, point1.z),
      new THREE.Vector3(point1.x, point1.y, point1.z),
      new THREE.Vector3(point1.x, point1.y, point1.z),
      new THREE.Vector3(point1.x, point1.y, point1.z), // Back to start to close the rectangle
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: opts.strokeColor,
      linewidth: opts.lineWidth,
      opacity: opts.opacity,
      transparent: opts.opacity !== undefined && opts.opacity < 1,
    });
    
    const rectangle = new THREE.Line(geometry, material);
    this.parent.add(rectangle);
    this.geometries.push(rectangle);
    
    // Set up animation - rectangle in X-Z plane (Y is constant)
    const startTime = this.clock.getElapsedTime();
    const targetPoints = [
      new THREE.Vector3(point1.x, point1.y, point1.z),
      new THREE.Vector3(point2.x, point1.y, point1.z),
      new THREE.Vector3(point2.x, point1.y, point2.z),
      new THREE.Vector3(point1.x, point1.y, point2.z),
      new THREE.Vector3(point1.x, point1.y, point1.z)
    ];
    
    this.animationStates.set(rectangle, {
      startTime,
      duration: opts.animationDuration || 1,
      completed: false,
      update: (progress: number) => {
        if (progress >= 1) return;
        
        const positions = (geometry.attributes.position as THREE.BufferAttribute).array;
        
        // Animate each point of the rectangle in sequence
        const segmentProgress = Math.min(1, progress * 5); // 5 segments in total
        const currentSegment = Math.min(4, Math.floor(segmentProgress));
        const pointProgress = segmentProgress - currentSegment;
        
        // Update already completed segments
        for (let i = 0; i <= currentSegment; i++) {
          positions[i * 3] = targetPoints[i].x;
          positions[i * 3 + 1] = targetPoints[i].y;
          positions[i * 3 + 2] = targetPoints[i].z;
        }
        
        // Update current animating segment if not the last one
        if (currentSegment < 4) {
          const startPoint = targetPoints[currentSegment];
          const endPoint = targetPoints[currentSegment + 1];
          
          const lerpedPoint = new THREE.Vector3().lerpVectors(
            startPoint,
            endPoint,
            pointProgress
          );
          
          positions[(currentSegment + 1) * 3] = lerpedPoint.x;
          positions[(currentSegment + 1) * 3 + 1] = lerpedPoint.y;
          positions[(currentSegment + 1) * 3 + 2] = lerpedPoint.z;
        }
        
        geometry.attributes.position.needsUpdate = true;
      }
    });
    
    return rectangle;
  }

  /**
   * Update all animations
   */
  update(): void {
    const currentTime = this.clock.getElapsedTime();
    
    this.animationStates.forEach((state) => {
      if (state.completed) return;
      
      const elapsed = currentTime - state.startTime;
      const progress = Math.min(1, elapsed / state.duration);
      
      state.update(progress);
      
      if (progress >= 1) {
        state.completed = true;
      }
    });
  }

  /**
   * Remove all shapes from the scene
   */
  clear(): void {
    this.geometries.forEach(geometry => {
      this.parent.remove(geometry);
      if (geometry instanceof THREE.Line || geometry instanceof THREE.Mesh) {
        geometry.geometry.dispose();
        if (Array.isArray(geometry.material)) {
          geometry.material.forEach(material => material.dispose());
        } else {
          geometry.material.dispose();
        }
      }
    });
    
    this.geometries = [];
    this.animationStates.clear();
  }
}
