import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Planet {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  mesh?: THREE.Mesh;
  orbit?: THREE.Line;
}

export default function SolarBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  );
  const rendererRef = useRef<THREE.WebGLRenderer>(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef<OrbitControls>(new OrbitControls(cameraRef.current, rendererRef.current.domElement));

  const planets = useMemo<Planet[]>(() => [
    { name: "Mercury", radius: 0.383, distance: 5, speed: 0.04, color: "#A0522D" },
    { name: "Venus", radius: 0.949, distance: 7, speed: 0.015, color: "#DEB887" },
    { name: "Earth", radius: 1, distance: 10, speed: 0.01, color: "#4169E1" },
    { name: "Mars", radius: 0.532, distance: 15, speed: 0.008, color: "#CD5C5C" },
    { name: "Jupiter", radius: 11.21, distance: 25, speed: 0.002, color: "#DAA520" },
    { name: "Saturn", radius: 9.45, distance: 35, speed: 0.0009, color: "#F4A460" },
    { name: "Uranus", radius: 4.01, distance: 45, speed: 0.0004, color: "#87CEEB" },
    { name: "Neptune", radius: 3.88, distance: 55, speed: 0.0001, color: "#4682B4" }
  ], []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current; // Store ref value

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    camera.position.y = 30;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Sun
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: "#FDB813" });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add planets
    planets.forEach((planet) => {
      // Planet mesh
      const geometry = new THREE.SphereGeometry(planet.radius * 0.5, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: planet.color });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      planet.mesh = mesh;

      // Orbit path
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints: number[] = [];
      for (let i = 0; i <= 360; i++) {
        const angle = (i * Math.PI) / 180;
        orbitPoints.push(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance);
      }
      orbitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
      planet.orbit = orbit;
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Update planet positions
      planets.forEach((planet) => {
        if (planet.mesh) {
          const time = Date.now() * planet.speed;
          planet.mesh.position.x = Math.cos(time) * planet.distance;
          planet.mesh.position.z = Math.sin(time) * planet.distance;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!cameraRef.current) return;
      const speed = 1;
      switch (event.key.toLowerCase()) {
        case "w":
          cameraRef.current.position.z -= speed;
          break;
        case "s":
          cameraRef.current.position.z += speed;
          break;
        case "a":
          cameraRef.current.position.x -= speed;
          break;
        case "d":
          cameraRef.current.position.x += speed;
          break;
        case "q":
          cameraRef.current.position.y += speed;
          break;
        case "e":
          cameraRef.current.position.y -= speed;
          break;
        case "r":
          cameraRef.current.rotation.x += 0.1;
          break;
        case "f":
          cameraRef.current.rotation.x -= 0.1;
          break;
        case "z":
          cameraRef.current.rotation.y += 0.1;
          break;
        case "x":
          cameraRef.current.rotation.y -= 0.1;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      container.removeChild(renderer.domElement); // Use stored value
    };
  }, [containerRef, cameraRef, rendererRef, controlsRef, planets]);

  return <div ref={containerRef} />;
}
