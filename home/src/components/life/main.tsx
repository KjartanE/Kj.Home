import * as THREE from "three";

// Constants for the game
export const BASE_CELL_SIZE = 20; // Base size that we'll adjust based on screen size
export const UPDATE_INTERVAL = 60; // ms between updates

export function getGridSize(containerWidth: number, containerHeight: number) {
  // Calculate cell size based on container dimensions
  // We want fewer cells on mobile for better interaction
  const targetCells = containerWidth < 768 ? 25 : 45; // Fewer cells on mobile
  const minDimension = Math.min(containerWidth, containerHeight);
  const cellSize = Math.floor(minDimension / targetCells);
  
  // Calculate grid dimensions
  const gridWidth = Math.floor(containerWidth / cellSize);
  const gridHeight = Math.floor(containerHeight / cellSize);
  
  return { 
    width: gridWidth, 
    height: gridHeight,
    cellSize: cellSize 
  };
}

// Class to handle the game logic
export class GameOfLife {
  grid: boolean[][];
  nextGrid: boolean[][];
  isRunning: boolean = false;
  updateInterval: number | null = null;
  onUpdate: (() => void) | null = null;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    // Initialize grids
    this.grid = Array(width)
      .fill(0)
      .map(() => Array(height).fill(false));
    this.nextGrid = Array(width)
      .fill(0)
      .map(() => Array(height).fill(false));
    this.randomize();
  }

  // Fill the grid with random values
  randomize(density: number = 0.4) {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.grid[i][j] = Math.random() < density;
      }
    }
    if (this.onUpdate) this.onUpdate();
  }

  // Clear the grid
  clear() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.grid[i][j] = false;
      }
    }
    if (this.onUpdate) this.onUpdate();
  }

  // Toggle a cell's state
  toggleCell(x: number, y: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[x][y] = !this.grid[x][y];
      if (this.onUpdate) this.onUpdate();
    }
  }

  // Count the live neighbors for a cell
  countNeighbors(x: number, y: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nx = (x + i + this.width) % this.width;
        const ny = (y + j + this.height) % this.height;
        if (this.grid[nx][ny]) count++;
      }
    }
    return count;
  }

  // Update the grid according to Conway's rules
  update() {
    // Calculate next generation
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const neighbors = this.countNeighbors(i, j);
        const isAlive = this.grid[i][j];

        // Apply Conway's rules
        if (isAlive && (neighbors < 2 || neighbors > 3)) {
          this.nextGrid[i][j] = false; // Dies from loneliness or overcrowding
        } else if (!isAlive && neighbors === 3) {
          this.nextGrid[i][j] = true; // Birth
        } else {
          this.nextGrid[i][j] = isAlive; // Remains the same
        }
      }
    }

    // Update current grid
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];

    if (this.onUpdate) this.onUpdate();
  }

  // Start the simulation
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.updateInterval = window.setInterval(() => this.update(), UPDATE_INTERVAL);
    }
  }

  // Pause the simulation
  pause() {
    if (this.isRunning && this.updateInterval !== null) {
      this.isRunning = false;
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Register update callback
  setUpdateCallback(callback: () => void) {
    this.onUpdate = callback;
  }
}

// Helper functions for THREE.js visualization
export function createGridGeometry(width: number, height: number, cellSize: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];

  // Create grid lines
  // Horizontal lines
  for (let i = 0; i <= height; i++) {
    vertices.push(0, i * cellSize, 0);
    vertices.push(width * cellSize, i * cellSize, 0);
  }

  // Vertical lines
  for (let i = 0; i <= width; i++) {
    vertices.push(i * cellSize, 0, 0);
    vertices.push(i * cellSize, height * cellSize, 0);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

export function createCellsMaterial(): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    color: 0xffffff,
    size: BASE_CELL_SIZE * 0.9,
    sizeAttenuation: true
  });
}

export function updateCellPositions(game: GameOfLife, points: THREE.Points) {
  const positions: number[] = [];

  // Add live cells to the positions array
  for (let i = 0; i < game.width; i++) {
    for (let j = 0; j < game.height; j++) {
      if (game.grid[i][j]) {
        // Center each cell by adding CELL_SIZE/2
        positions.push(i * BASE_CELL_SIZE + BASE_CELL_SIZE / 2, j * BASE_CELL_SIZE + BASE_CELL_SIZE / 2, 0);
      }
    }
  }

  // Update the geometry
  const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
  points.geometry.setAttribute("position", positionAttribute);
  points.geometry.attributes.position.needsUpdate = true;
}

// Convert screen coordinates to grid coordinates
export function screenToGrid(
  x: number,
  y: number,
  camera: THREE.OrthographicCamera,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  // Normalize device coordinates (NDC)
  const ndcX = (x / containerWidth) * 2 - 1;
  const ndcY = -(y / containerHeight) * 2 + 1;

  // Create a vector from NDC
  const vector = new THREE.Vector3(ndcX, ndcY, 0);

  // Unproject the vector
  vector.unproject(camera);

  // Calculate grid coordinates
  const gridX = Math.floor(vector.x / BASE_CELL_SIZE);
  const gridY = Math.floor(vector.y / BASE_CELL_SIZE);

  return { x: gridX, y: gridY };
}
