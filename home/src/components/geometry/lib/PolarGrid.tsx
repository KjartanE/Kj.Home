import * as THREE from "three";

/**
 * PolarGrid class for creating a 2D polar coordinate grid with cardinal directions
 */
export class PolarGrid {
  private scene: THREE.Scene;
  private grid: THREE.Group;
  private maxRadius: number;
  private numCircles: number;
  private numDirections: number;
  private isNestedGrid: boolean;
  private nestedGridScale: number;

  /**
   * Create a polar grid with cardinal directions
   * @param scene - The Three.js scene to add the grid to
   * @param maxRadius - The maximum radius of the grid
   * @param numCircles - Number of concentric circles
   * @param numDirections - Number of cardinal directions (default: 6)
   * @param position - Position of the grid (default: origin)
   * @param isNestedGrid - Whether this is a nested grid (default: false)
   * @param nestedGridScale - Scale factor for nested grids (default: 0.2)
   */
  constructor(
    scene: THREE.Scene, 
    maxRadius: number = 10, 
    numCircles: number = 5, 
    numDirections: number = 6,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    isNestedGrid: boolean = false,
    nestedGridScale: number = 0.2
  ) {
    this.scene = scene;
    this.maxRadius = maxRadius;
    this.numCircles = numCircles;
    this.numDirections = numDirections;
    this.isNestedGrid = isNestedGrid;
    this.nestedGridScale = nestedGridScale;
    this.grid = new THREE.Group();
    this.grid.position.copy(position);

    this.createGrid();
    scene.add(this.grid);
  }

  /**
   * Create the polar grid with circles and direction lines
   */
  private createGrid(): void {
    // Create concentric circles
    this.createConcentricCircles();

    // Create cardinal direction lines
    this.createDirectionLines();

    // Create triangular intersection patterns
    this.createTriangularPatterns();

    // Create nested grids at intersection points (only for the main grid)
    if (!this.isNestedGrid) {
      this.createNestedGrids();
    }
  }

  /**
   * Create nested polar grids at each intersection point
   */
  private createNestedGrids(): void {
    // For each concentric circle
    for (let i = 1; i <= this.numCircles; i++) {
      const radius = (i / this.numCircles) * this.maxRadius;

      // Calculate intersection points on this circle for each cardinal direction
      for (let j = 0; j < this.numDirections; j++) {
        const theta = (j / this.numDirections) * Math.PI * 2 + Math.PI / 6;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        // Create a position vector for the nested grid
        const position = new THREE.Vector3(x, 0, z);
        
        // Create a smaller nested grid at this position
        // We don't want the nested grids to create more nested grids, so we set isNestedGrid to true
        new PolarGrid(
          this.scene,
          this.maxRadius * this.nestedGridScale,
          this.numCircles,
          this.numDirections,
          position,
          true, // This is a nested grid
          this.nestedGridScale
        );
      }
    }
  }

  /**
   * Create concentric circles for the polar grid
   */
  private createConcentricCircles(): void {
    if (this.isNestedGrid) {
      return;
    }

    const material = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity:  0.5
    });

    for (let i = 1; i <= this.numCircles; i++) {
      const radius = (i / this.numCircles) * this.maxRadius;
      const geometry = new THREE.BufferGeometry();

      // Create a circle
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
      }

      geometry.setFromPoints(points);
      const circle = new THREE.Line(geometry, material);
      this.grid.add(circle);
    }
  }

  /**
   * Create cardinal direction lines
   */
  private createDirectionLines(): void {
    if (this.isNestedGrid) {
      return;
    }

    const material = new THREE.LineBasicMaterial({
      color: 0x666666,
      opacity: 1
    });

    for (let i = 0; i < this.numDirections; i++) {
      const theta = (i / this.numDirections) * Math.PI * 2 + Math.PI / 6;
      const geometry = new THREE.BufferGeometry();

      // Create a line from center to edge
      const points = [
        new THREE.Vector3(0, 0.1, 0),
        new THREE.Vector3(this.maxRadius * Math.cos(theta), 0.1, this.maxRadius * Math.sin(theta))
      ];

      geometry.setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.grid.add(line);
    }
  }

  /**
   * Create triangular intersection patterns at each concentric circle
   */
  private createTriangularPatterns(): void {
    const material = new THREE.LineBasicMaterial({
      color: this.isNestedGrid ? 0x333333 : 0xffffff,
      transparent: true,
      opacity: this.isNestedGrid ? 0.3 : 0.8
    });

    // For each concentric circle
    for (let i = 1; i <= this.numCircles; i++) {
      const radius = (i / this.numCircles) * this.maxRadius;

      let y = 0.1;
      if (this.isNestedGrid) {
        y = 0;
      }

      // Calculate intersection points on this circle for each cardinal direction
      const intersectionPoints: THREE.Vector3[] = [];

      for (let j = 0; j < this.numDirections; j++) {
        const theta = (j / this.numDirections) * Math.PI * 2 + Math.PI / 6;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        intersectionPoints.push(new THREE.Vector3(x, y, z));
      }

      // Create triangular patterns by connecting alternate points
      for (let j = 0; j < this.numDirections; j++) {
        const startPoint = intersectionPoints[j];

        // Connect to alternating points to create triangular pattern
        // For 6 directions, connect to points that are 2 steps away
        const nextIndex = (j + 1) % this.numDirections;
        const nextPoint = intersectionPoints[nextIndex];

        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([startPoint, nextPoint]);

        const line = new THREE.Line(geometry, material);
        this.grid.add(line);
      }
    }
  }

  /**
   * Remove the grid from the scene
   */
  public dispose(): void {
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          }
        } else if (object instanceof THREE.Line) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    }
  }

  /**
   * Update method (can be extended for animations)
   */
  public update(): void {
    // Can be extended for animations or updates
  }
}
