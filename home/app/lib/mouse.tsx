import { MutableRefObject } from "react";
import * as THREE from "three";

export class mouseController {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private vertices: THREE.Vector3[];
  private meshes: THREE.Mesh[];
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private selectedObject: THREE.Object3D | null;
  private selectedObjectMaterial: THREE.Material | null;
  private selectedObjectOriginalColor: number | null;
  private selectedObjectOriginalOpacity: number | null;
  private mouseDownPosition: MutableRefObject<{ x: number; y: number }>;
  private isDragging: MutableRefObject<boolean>;

  constructor(
    camera: THREE.Camera,
    scene: THREE.Scene,
    vertices: THREE.Vector3[],
    meshes: THREE.Mesh[],
    mouseDownPosition: MutableRefObject<{ x: number; y: number }>,
    isDragging: MutableRefObject<boolean>
  ) {
    this.scene = scene;
    this.camera = camera;
    this.vertices = vertices;
    this.meshes = meshes;
    this.mouse = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.selectedObject = null;
    this.selectedObjectMaterial = null;
    this.selectedObjectOriginalColor = null;
    this.selectedObjectOriginalOpacity = null;
    this.mouseDownPosition = mouseDownPosition;
    this.isDragging = isDragging;
  }

  onMouseClick(event: MouseEvent) {
    // Get mouse position in screen space
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Initialize a variable to store the hits (intersections)
    let hits: THREE.Intersection[] = [];

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Raycast to single object
    hits = this.raycaster.intersectObjects(this.meshes, true);

    // If you have multiple objects, you can pass an array of objects to intersectObjects
    // hits = raygun.intersectObjects([myTargetObect, myTargetObect2]);

    this.drawRay(this.raycaster);

    // Run if we have intersections
    if (hits.length > 0) {
      const coords = hits[0].point; // THREE.Vector3

      console.log("coords", coords);

      // We have the 3D coordinates of the click event!
      // Here you can use these coordinates to do something

      // In my case, we'll find the nearest vertex index
      const { index, position } = this.findNearestVertexIndex(hits[0].point);

      console.log("position", position);
      console.log("index", index);

      // Do something with the vertex index
      // Such as highlighting the vertex or displaying information
    }
  }

  drawRay(raycaster: THREE.Raycaster) {
    // Remove the previous line if it exists
    const prevLine = this.scene.getObjectByName("rayLine");

    if (prevLine) {
      this.scene.remove(prevLine);
    }

    // The raycaster.ray contains the origin and direction
    const origin = raycaster.ray.origin;
    const direction = raycaster.ray.direction.clone().multiplyScalar(100); // Extend the direction
    const end = origin.clone().add(direction);

    const geometry = new THREE.BufferGeometry().setFromPoints([origin, end]);
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000 // Make it RED
    });
    const line = new THREE.Line(geometry, material);

    line.name = "rayLine"; // Name the line for easy reference

    this.scene.add(line);
  }

  findNearestVertexIndex(point: THREE.Vector3) {
    const { x: x0, y: y0, z: z0 } = point;
    let minDistance = Infinity;
    let nearestVertexIndex = -1;
    let position = new THREE.Vector3();

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const { x: x1, y: y1, z: z1 } = vertex;
      const distance = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2) + Math.pow(z1 - z0, 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearestVertexIndex = i;
      }
    }
    try {
      position = new THREE.Vector3(
        this.vertices[nearestVertexIndex].x,
        this.vertices[nearestVertexIndex].y,
        this.vertices[nearestVertexIndex].z
      );
    } catch (err) {
      // Handle error
      console.log(err);
    }

    return {
      position,
      index: nearestVertexIndex
    };
  }

  onMouseDown(event: MouseEvent) {
    // Store the starting position of the mouse
    this.mouseDownPosition.current = {
      x: event.clientX,
      y: event.clientY
    };
    this.isDragging.current = false; // Reset the dragging state
  }

  onMouseMove(event: MouseEvent) {
    // Calculate the distance the mouse has moved since mouse down
    const dx = event.clientX - this.mouseDownPosition.current.x;
    const dy = event.clientY - this.mouseDownPosition.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is greater than the threshold, set dragging to true
    const threshold = 5;

    if (distance > threshold) {
      this.isDragging.current = true;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isDragging.current) {
      // The mouse did not drag beyond the threshold, so treat this as a click

      this.onMouseClick(event); // We'll define this soon
    }
    // Reset isDragging for the next mouse down event
    this.isDragging.current = false;
  }
}
