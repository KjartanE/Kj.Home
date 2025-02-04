"use client";

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

// Update sun shaders for a more realistic appearance
const sunVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  uniform vec3 glowColor;
  uniform vec3 viewPosition;
  uniform float time;
  
  // Noise functions for surface detail
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec3 worldViewDir = normalize(viewPosition - vWorldPosition);
    float fresnel = pow(1.0 - dot(vNormal, worldViewDir), 1.5);
    
    // Dynamic noise-based surface detail
    vec2 uv = vUv * 10.0;
    float n = noise(uv + time * 0.2);
    
    // Core colors with noise variation
    vec3 coreColor = vec3(1.0, 0.3, 0.0) * 2.0;
    vec3 midColor = vec3(1.0, 0.5, 0.0) * 1.8;
    vec3 edgeColor = vec3(1.0, 0.7, 0.0) * 1.6;
    
    float radius = length(vUv - vec2(0.5, 0.5)) * 1.8;
    float gradient = 1.0 - smoothstep(0.0, 1.0, radius);
    
    // Add noise-based variation to emission
    float emission = pow(gradient, 0.5) * (2.8 + n * 0.5);
    
    // Surface detail
    float detail = pow(n, 2.0) * 0.5;
    vec3 finalColor = mix(
      mix(coreColor, midColor, radius + detail),
      edgeColor,
      fresnel + detail
    ) * emission;
    
    float alpha = (gradient + fresnel * 0.5) * emission;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Update the planet shaders
const planetVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const planetFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 baseColor;
  uniform vec3 sunPosition;
  
  void main() {
    vec3 dirToSun = normalize(sunPosition - vWorldPosition);
    vec3 worldNormal = normalize(vNormal);
    
    // Increased diffuse intensity
    float diffuse = max(0.0, dot(worldNormal, dirToSun)) * 2.0;  // Multiplied by 2.0
    
    // Adjusted falloff for brighter lighting at distance
    float distToSun = length(sunPosition - vWorldPosition);
    float falloff = 200.0 / (distToSun * distToSun);  // Increased from 100.0
    
    vec3 finalColor = baseColor * diffuse * falloff;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function SolarBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(
    new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  );
  const rendererRef = useRef<THREE.WebGLRenderer>(new THREE.WebGLRenderer({ antialias: true }));
  const controlsRef = useRef<OrbitControls>(new OrbitControls(cameraRef.current, rendererRef.current.domElement));

  const planets = useMemo<Planet[]>(() => [
    { name: "Mercury", radius: 0.383, distance: 5, speed: 0.00137, color: "#8B7355" },  // 88 days
    { name: "Venus", radius: 0.949, distance: 7, speed: 0.00054, color: "#DAA520" },   // 225 days
    { name: "Earth", radius: 1, distance: 10, speed: 0.00033, color: "#4169E1" },      // 365.26 days (1rpm)
    { name: "Mars", radius: 0.532, distance: 15, speed: 0.00018, color: "#CD5C5C" },   // 687 days
    { name: "Jupiter", radius: 11.21, distance: 25, speed: 0.000028, color: "#DEB887" }, // 11.86 years
    { name: "Saturn", radius: 9.45, distance: 35, speed: 0.000011, color: "#F4A460" },  // 29.46 years
    { name: "Uranus", radius: 4.01, distance: 45, speed: 0.0000039, color: "#87CEEB" }, // 84.01 years
    { name: "Neptune", radius: 3.88, distance: 55, speed: 0.0000020, color: "#4682B4" }  // 164.79 years
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
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    controls.panSpeed = 0.5;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controls.enablePan = false;  // Disable OrbitControls panning
    controlsRef.current = controls;

    // Create sun layers
    const sunCore = new THREE.Group();

    // Inner core (photosphere)
    const coreGeometry = new THREE.SphereGeometry(3.5, 64, 64);
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color("#FFA500") },
        viewPosition: { value: camera.position },
        time: { value: 0.0 }
      },
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Chromosphere - reddish layer
    const chromosphereGeometry = new THREE.SphereGeometry(3.7, 64, 64);
    const chromosphereMaterial = coreMaterial.clone();
    chromosphereMaterial.uniforms.glowColor.value = new THREE.Color("#FF4500");
    const chromosphere = new THREE.Mesh(chromosphereGeometry, chromosphereMaterial);

    // Add layers to sun group
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    sunCore.add(core);
    sunCore.add(chromosphere);

    scene.add(sunCore);

    // Brighter point light from sun
    const sunLight = new THREE.PointLight(0xFF4400, 10, 500);  // Increased intensity and range
    scene.add(sunLight);

    // Add planets
    planets.forEach((planet) => {
      // Planet mesh
      const geometry = new THREE.SphereGeometry(planet.radius * 0.5, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          baseColor: { value: new THREE.Color(planet.color) },
          sunPosition: { value: new THREE.Vector3(0, 0, 0) }  // Sun is at center
        },
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader
      });
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

      // Update shader time uniforms
      const time = Date.now() * 0.001;
      coreMaterial.uniforms.time.value = time;
      chromosphereMaterial.uniforms.time.value = time;

      // Rotate layers
      core.rotation.y += 0.0005;
      chromosphere.rotation.y += 0.0003;

      // Update planet positions and lighting
      planets.forEach((planet) => {
        if (planet.mesh) {
          const time = Date.now() * planet.speed;
          planet.mesh.position.x = Math.cos(time) * planet.distance;
          planet.mesh.position.z = Math.sin(time) * planet.distance;
          
          // Update the sun position uniform for each planet's shader
          (planet.mesh.material as THREE.ShaderMaterial).uniforms.sunPosition.value.set(0, 0, 0);
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
      const speed = 2;
      
      // Get the camera's right vector for proper left/right movement
      const rightVector = new THREE.Vector3();
      cameraRef.current.getWorldDirection(rightVector);
      rightVector.cross(cameraRef.current.up).normalize();

      switch (event.key.toLowerCase()) {
        case "w":
          cameraRef.current.translateZ(-speed);
          break;
        case "s":
          cameraRef.current.translateZ(speed);
          break;
        case "a":
          cameraRef.current.position.addScaledVector(rightVector, -speed);
          break;
        case "d":
          cameraRef.current.position.addScaledVector(rightVector, speed);
          break;
        case "q":
          cameraRef.current.translateY(speed);
          break;
        case "e":
          cameraRef.current.translateY(-speed);
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
