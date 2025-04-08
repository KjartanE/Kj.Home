"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GameOfLife, createGridGeometry, getGridSize } from "./main";

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameOfLife | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Store ref to container element for cleanup
    const container = containerRef.current;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Create renderer that fills the container
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    container.appendChild(renderer.domElement);

    const { width, height, cellSize } = getGridSize(containerWidth, containerHeight);

    // Create grid geometry and material
    const gridGeometry = createGridGeometry(width, height, cellSize);
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);

    // Position the grid at the origin (0,0,0)
    gridLines.position.set(0, 0, 0);
    scene.add(gridLines);

    // Create instanced mesh for cells
    const cellGeometry = new THREE.PlaneGeometry(cellSize * 0.9, cellSize * 0.9);
    const cellMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00, // Bright green color for better visibility
      side: THREE.DoubleSide
    });

    // Keep track of cell instances
    const cellInstances: THREE.InstancedMesh = new THREE.InstancedMesh(cellGeometry, cellMaterial, width * height);
    cellInstances.count = 0; // Start with no cells
    scene.add(cellInstances);

    // Initialize Game of Life
    const game = new GameOfLife(width, height);
    gameRef.current = game;

    // Update cell instances based on game state
    const updateCells = () => {
      // Reset instance count
      cellInstances.count = 0;

      // Matrix for positioning
      const matrix = new THREE.Matrix4();

      // Add instances for each live cell
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          if (game.grid[x][y]) {
            // Position each cell at the center of its grid cell
            matrix.setPosition(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 0);
            cellInstances.setMatrixAt(cellInstances.count, matrix);
            cellInstances.count++;
          }
        }
      }

      // Update the instance matrix buffer
      cellInstances.instanceMatrix.needsUpdate = true;
    };

    // Set up update callback
    game.setUpdateCallback(updateCells);

    // Initial update
    updateCells();

    // Create a camera with fixed orthographic view - will be adjusted in resize
    const camera = new THREE.OrthographicCamera(0, width * cellSize, 0, height * cellSize, 0.1, 1000);

    // Position camera directly overhead at center of grid
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Resize handler - adjust camera to fit grid in view
    const handleResize = () => {
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      renderer.setSize(containerWidth, containerHeight);

      // Get updated grid size based on new container dimensions
      const {
        width: newWidth,
        height: newHeight,
        cellSize: newCellSize
      } = getGridSize(containerWidth, containerHeight);

      // Update camera frustum to match new grid size
      camera.left = 0;
      camera.right = newWidth * newCellSize;
      camera.top = 0;
      camera.bottom = newHeight * newCellSize;
      camera.updateProjectionMatrix();

      // Update camera position to center on grid
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      // Update grid and cells
      scene.remove(gridLines);
      const newGridGeometry = createGridGeometry(newWidth, newHeight, newCellSize);
      gridLines.geometry = newGridGeometry;
      scene.add(gridLines);

      // Update cell geometry
      const newCellGeometry = new THREE.PlaneGeometry(newCellSize * 0.9, newCellSize * 0.9);
      cellInstances.geometry = newCellGeometry;

      // Update game
      game.width = newWidth;
      game.height = newHeight;
      game.grid = Array(newWidth)
        .fill(0)
        .map(() => Array(newHeight).fill(false));
      game.nextGrid = Array(newWidth)
        .fill(0)
        .map(() => Array(newHeight).fill(false));
      game.randomize();
    };

    // Add event listener and trigger initial resize
    window.addEventListener("resize", handleResize);
    handleResize();

    // Create a raycaster for accurate mouse position detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Variables for tracking mouse state
    let isDrawing = false;
    let lastCellX = -1;
    let lastCellY = -1;

    // Convert mouse position to grid coordinates
    const getGridCoordsFromMouse = (clientX: number, clientY: number) => {
      if (!container) return null;

      const rect = container.getBoundingClientRect();

      // Calculate normalized device coordinates (-1 to +1)
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Set the raycaster
      raycaster.setFromCamera(mouse, camera);

      // Create a plane at z=0 where our grid is
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

      // Get the intersection point
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      // Convert to grid coordinates
      // The intersection point is now in world coordinates where (0,0) is the bottom-left corner
      const gridX = Math.floor(intersection.x / cellSize);
      const gridY = Math.floor(intersection.y / cellSize);

      // Check if in bounds
      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        return { x: gridX, y: gridY };
      }

      return null;
    };

    // Handle mouse events for drawing
    const handleMouseDown = (event: MouseEvent) => {
      // Left mouse button only (0)
      if (event.button !== 0) return;

      const gridCoords = getGridCoordsFromMouse(event.clientX, event.clientY);
      if (gridCoords && game) {
        isDrawing = true;

        // Toggle cell on first click
        game.toggleCell(gridCoords.x, gridCoords.y);

        // Remember this cell to avoid toggling it again while dragging
        lastCellX = gridCoords.x;
        lastCellY = gridCoords.y;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing || !game) return;

      const gridCoords = getGridCoordsFromMouse(event.clientX, event.clientY);
      if (gridCoords) {
        // Only update if we've moved to a new cell
        if (gridCoords.x !== lastCellX || gridCoords.y !== lastCellY) {
          // Activate the cell (don't toggle, just turn on)
          if (!game.grid[gridCoords.x][gridCoords.y]) {
            game.toggleCell(gridCoords.x, gridCoords.y);
          }

          lastCellX = gridCoords.x;
          lastCellY = gridCoords.y;
        }
      }
    };

    const handleMouseUp = () => {
      if (isDrawing) {
        isDrawing = false;
        lastCellX = -1;
        lastCellY = -1;
      }
    };

    // Add mouse event listeners for drawing
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp); // Use window to catch mouseup outside container

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener("mousedown", handleMouseDown);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeChild(renderer.domElement);
      }

      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);

      if (game.isRunning) {
        game.pause();
      }

      scene.remove(gridLines);
      scene.remove(cellInstances);
      gridGeometry.dispose();
      gridMaterial.dispose();
      cellGeometry.dispose();
      cellMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Game controls
  const toggleSimulation = () => {
    if (!gameRef.current) return;

    if (isRunning) {
      gameRef.current.pause();
    } else {
      gameRef.current.start();
    }

    setIsRunning(!isRunning);
  };

  const randomizeGrid = () => {
    if (!gameRef.current) return;
    gameRef.current.randomize();
  };

  const clearGrid = () => {
    if (!gameRef.current) return;
    gameRef.current.clear();
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0" ref={containerRef}></div>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-4 rounded-lg bg-black/50 p-4 backdrop-blur-md">
        <button onClick={toggleSimulation} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          {isRunning ? "Pause" : "Start"}
        </button>
        <button onClick={clearGrid} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          Clear
        </button>
        <button onClick={randomizeGrid} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Randomize
        </button>
      </div>
    </div>
  );
}
