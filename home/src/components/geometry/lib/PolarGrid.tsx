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
  
  // Shared materials
  private static circlesMaterial: THREE.LineBasicMaterial;
  private static directionsMaterial: THREE.LineBasicMaterial;
  private static mainTriangleMaterial: THREE.LineBasicMaterial;
  private static nestedTriangleMaterial: THREE.LineBasicMaterial;
  
  // Reusable vector for calculations
  private static tempVector = new THREE.Vector3();

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

    // Initialize shared materials if not already created
    this.initMaterials();

    this.createGrid();
    scene.add(this.grid);
  }

  /**
   * Initialize shared materials if they don't exist yet
   */
  private initMaterials(): void {
    // Only create materials once across all instances
    if (!PolarGrid.circlesMaterial) {
      PolarGrid.circlesMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.5
      });
    }

    if (!PolarGrid.directionsMaterial) {
      PolarGrid.directionsMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        opacity: 1
      });
    }

    if (!PolarGrid.mainTriangleMaterial) {
      PolarGrid.mainTriangleMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
    }

    if (!PolarGrid.nestedTriangleMaterial) {
      PolarGrid.nestedTriangleMaterial = new THREE.LineBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3
      });
    }
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
    // Reusable position vector
    const position = new THREE.Vector3();
    
    // For each concentric circle
    for (let i = 1; i <= this.numCircles; i++) {
      const radius = (i / this.numCircles) * this.maxRadius;

      // Calculate intersection points on this circle for each cardinal direction
      for (let j = 0; j < this.numDirections; j++) {
        const theta = (j / this.numDirections) * Math.PI * 2 + Math.PI / 6;
        
        // Reuse position vector
        position.set(
          radius * Math.cos(theta),
          0,
          radius * Math.sin(theta)
        );
        
        // Create a smaller nested grid at this position
        new PolarGrid(
          this.scene,
          this.maxRadius * this.nestedGridScale,
          this.numCircles,
          this.numDirections,
          position.clone(), // Need to clone since position is reused
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

    // Use the shared material
    const material = PolarGrid.circlesMaterial;
    
    // Set number of segments for each circle
    const segments = 64;
    
    // Create a buffer for circle points
    const circleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    circleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    for (let i = 1; i <= this.numCircles; i++) {
      const radius = (i / this.numCircles) * this.maxRadius;
      
      // Generate the circle points directly into the buffer
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        const index = j * 3;
        positions[index] = x;
        positions[index + 1] = 0;
        positions[index + 2] = z;
      }
      
      // Update the buffer
      circleGeometry.attributes.position.needsUpdate = true;
      
      // Create a circle with the updated geometry
      const circle = new THREE.Line(circleGeometry.clone(), material);
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

    // Use the shared material
    const material = PolarGrid.directionsMaterial;
    
    // Create a reusable line geometry
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6); // 2 points × 3 coordinates
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Set the start point at origin (doesn't change)
    positions[0] = 0;
    positions[1] = 0.1;
    positions[2] = 0;

    for (let i = 0; i < this.numDirections; i++) {
      const theta = (i / this.numDirections) * Math.PI * 2 + Math.PI / 6;
      
      // Set end point coordinates directly into the buffer
      positions[3] = this.maxRadius * Math.cos(theta);
      positions[4] = 0.1;
      positions[5] = this.maxRadius * Math.sin(theta);
      
      // Update the buffer
      lineGeometry.attributes.position.needsUpdate = true;
      
      // Create a line with the updated geometry
      const line = new THREE.Line(lineGeometry.clone(), material);
      this.grid.add(line);
    }
  }

  /**
   * Create triangular intersection patterns at each concentric circle
   */
  private createTriangularPatterns(): void {
    // Use the appropriate shared material based on grid type
    const material = this.isNestedGrid ? 
      PolarGrid.nestedTriangleMaterial : 
      PolarGrid.mainTriangleMaterial;

    const y = this.isNestedGrid ? 0 : 0.1;
    
    // Pre-calculate and store all intersection points
    const allIntersectionPoints: THREE.Vector3[][] = [];
    
    // For each concentric circle
    for (let i = 1; i <= this.numCircles; i++) {
      const radius = (i / this.numCircles) * this.maxRadius;
      
      // Calculate intersection points on this circle for each cardinal direction
      const circlePoints: THREE.Vector3[] = [];
      allIntersectionPoints.push(circlePoints);

      for (let j = 0; j < this.numDirections; j++) {
        const theta = (j / this.numDirections) * Math.PI * 2 + Math.PI / 6;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        circlePoints.push(new THREE.Vector3(x, y, z));
      }
    }

    // Create a single reusable geometry and reuse it for all lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(2 * 3); // 2 points × 3 coordinates
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    // Reuse the same array buffer to update geometry
    for (let i = 0; i < allIntersectionPoints.length; i++) {
      const circlePoints = allIntersectionPoints[i];
      
      for (let j = 0; j < this.numDirections; j++) {
        const startPoint = circlePoints[j];
        const nextIndex = (j + 1) % this.numDirections;
        const nextPoint = circlePoints[nextIndex];
        
        // Update the buffer directly
        // Start point
        linePositions[0] = startPoint.x;
        linePositions[1] = startPoint.y;
        linePositions[2] = startPoint.z;
        // End point
        linePositions[3] = nextPoint.x;
        linePositions[4] = nextPoint.y;
        linePositions[5] = nextPoint.z;
        
        // Notify that attributes have changed
        lineGeometry.attributes.position.needsUpdate = true;
        
        // Clone the geometry for this line
        const lineInstance = new THREE.Line(lineGeometry.clone(), material);
        this.grid.add(lineInstance);
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
