"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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

    // Create camera (will be adjusted in resize handler)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 10;

    // Create grid geometry and material
    const gridGeometry = createGridGeometry();
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(gridLines);

    // Create instanced mesh for cells
    const cellGeometry = new THREE.PlaneGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9);
    const cellMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
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
            matrix.setPosition(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 0);
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

    // Resize handler - ensure grid fills width
    const handleResize = () => {
      if (!container) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      // Calculate aspect ratios
      const containerAspect = newWidth / newHeight;
      const gridAspect = gridWidth / gridHeight;

      let width, height;

      if (containerAspect > gridAspect) {
        // Container is wider than grid - fill width
        width = gridWidth;
        height = width / containerAspect;
      } else {
        // Container is taller than grid - fill height
        height = gridHeight;
        width = height * containerAspect;
      }

      // Set camera frustum
      camera.right = gridWidth;
      camera.top = gridHeight;

      // Update camera
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    // Add event listener and trigger initial resize
    window.addEventListener("resize", handleResize);
    handleResize();

    // Create a raycaster for accurate mouse position detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Handle mouse click with proper raycasting
    const handleMouseClick = (event: MouseEvent) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // Calculate normalized device coordinates (-1 to +1)
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Set the raycaster from the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate the intersection with the plane at z=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      // Convert to grid coordinates
      const gridX = Math.floor(intersectionPoint.x);
      const gridY = Math.floor(intersectionPoint.y);

      if (game && gridX >= 0 && gridX < GRID_SIZE_X && gridY >= 0 && gridY < GRID_SIZE_Y) {
        game.toggleCell(gridX, gridY);
      }
    };

    container.addEventListener("click", handleMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener("click", handleMouseClick);
        container.removeChild(renderer.domElement);
      }
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
