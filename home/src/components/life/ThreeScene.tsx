"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GameOfLife, GRID_SIZE_X, GRID_SIZE_Y, CELL_SIZE, createGridGeometry } from "./main";

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

    // Calculate the grid dimensions
    const gridWidth = GRID_SIZE_X * CELL_SIZE;
    const gridHeight = GRID_SIZE_Y * CELL_SIZE;

    // Create grid geometry and material
    const gridGeometry = createGridGeometry();
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(gridLines);

    // Position the grid at origin
    gridLines.position.set(0, 0, 0);

    // Create instanced mesh for cells
    const cellGeometry = new THREE.PlaneGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9);
    const cellMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    });
    
    // Keep track of cell instances
    const cellInstances: THREE.InstancedMesh = new THREE.InstancedMesh(
      cellGeometry, 
      cellMaterial, 
      GRID_SIZE_X * GRID_SIZE_Y
    );
    cellInstances.count = 0; // Start with no cells
    scene.add(cellInstances);

    // Initialize Game of Life
    const game = new GameOfLife();
    gameRef.current = game;

    // Update cell instances based on game state
    const updateCells = () => {
      // Reset instance count
      cellInstances.count = 0;
      
      // Matrix for positioning
      const matrix = new THREE.Matrix4();
      
      // Add instances for each live cell
      for (let x = 0; x < GRID_SIZE_X; x++) {
        for (let y = 0; y < GRID_SIZE_Y; y++) {
          if (game.grid[x][y]) {
            matrix.setPosition(
              x * CELL_SIZE + CELL_SIZE / 2,
              y * CELL_SIZE + CELL_SIZE / 2,
              0
            );
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
    const camera = new THREE.OrthographicCamera(
      -1, 1, 1, -1, // Temporary values, will be set in handleResize
      0.1, 1000
    );
    
    // Position camera directly overhead at center of grid
    camera.position.set(gridWidth/2, gridHeight/2, 10);
    
    // Setup orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.panSpeed = 0.1; // Slower panning for better control
    
    // Set zoom limits
    controls.minZoom = 1;  // Allow zooming out to see 2x the grid
    controls.maxZoom = 2;   // Allow zooming in to see fine details
    
    // Set initial target to center of grid
    controls.target.set(gridWidth/2, gridHeight/2, 0);
    controls.update();

    // Resize handler - adjust camera to fit grid in view
    const handleResize = () => {
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      
      // Simple approach: just show the whole grid

      camera.left = -gridWidth/2;
      camera.right = gridWidth/2;
      camera.bottom = -gridHeight/2;
      camera.top = gridHeight/2;

      camera.updateProjectionMatrix();
      controls.update();
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
      const gridX = Math.floor(intersection.x);
      const gridY = Math.floor(intersection.y);
      
      // Check if in bounds
      if (gridX >= 0 && gridX < GRID_SIZE_X && 
          gridY >= 0 && gridY < GRID_SIZE_Y) {
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
        
        // Disable orbit controls while drawing
        controls.enabled = false;
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
        
        // Re-enable orbit controls after drawing
        controls.enabled = true;
      }
    };
    
    // Add mouse event listeners for drawing
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp); // Use window to catch mouseup outside container
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    // Cleanup
    return () => {
      controls.dispose();
      
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
