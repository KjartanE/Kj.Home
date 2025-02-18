"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface Moon {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  mesh?: THREE.Mesh;
  orbit?: THREE.Line;
  tracer?: THREE.Points;
  tracerPositions: number[];
  parent: string; // Name of the parent planet
}

interface Planet {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  mesh?: THREE.Mesh;
  orbit?: THREE.Line;
  moons: Moon[]; // Add moons array to Planet interface
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
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const planets = useMemo<Planet[]>(
    () => [
      {
        name: "Mercury",
        radius: 0.383,
        distance: 5,
        speed: 0.00137,
        color: "#8B7355",
        moons: []
      },
      {
        name: "Venus",
        radius: 0.949,
        distance: 7,
        speed: 0.00054,
        color: "#DAA520",
        moons: []
      },
      {
        name: "Earth",
        radius: 1,
        distance: 10,
        speed: 0.00033,
        color: "#4169E1",
        moons: [
          {
            name: "Moon",
            radius: 0.2,
            distance: 2,
            speed: 0.002,
            color: "#888888",
            tracerPositions: [],
            parent: "Earth"
          }
        ]
      },
      {
        name: "Mars",
        radius: 0.532,
        distance: 15,
        speed: 0.00018,
        color: "#CD5C5C",
        moons: [
          {
            name: "Phobos",
            radius: 0.1,
            distance: 1.4,
            speed: 0.003,
            color: "#A0522D",
            tracerPositions: [],
            parent: "Mars"
          },
          {
            name: "Deimos",
            radius: 0.08,
            distance: 1.8,
            speed: 0.002,
            color: "#8B4513",
            tracerPositions: [],
            parent: "Mars"
          }
        ]
      },
      {
        name: "Jupiter",
        radius: 11.21,
        distance: 25,
        speed: 0.000028,
        color: "#DEB887",
        moons: [
          {
            name: "Io",
            radius: 0.285,
            distance: 3.5,
            speed: 0.004,
            color: "#FFD700",
            tracerPositions: [],
            parent: "Jupiter"
          },
          {
            name: "Europa",
            radius: 0.246,
            distance: 4.5,
            speed: 0.003,
            color: "#F5F5DC",
            tracerPositions: [],
            parent: "Jupiter"
          },
          {
            name: "Ganymede",
            radius: 0.413,
            distance: 5.5,
            speed: 0.002,
            color: "#D2B48C",
            tracerPositions: [],
            parent: "Jupiter"
          },
          {
            name: "Callisto",
            radius: 0.378,
            distance: 6.5,
            speed: 0.001,
            color: "#A0522D",
            tracerPositions: [],
            parent: "Jupiter"
          }
        ]
      },
      {
        name: "Saturn",
        radius: 9.45,
        distance: 35,
        speed: 0.000011,
        color: "#F4A460",
        moons: [
          {
            name: "Titan",
            radius: 0.404,
            distance: 4.0,
            speed: 0.003,
            color: "#DAA520",
            tracerPositions: [],
            parent: "Saturn"
          },
          {
            name: "Rhea",
            radius: 0.12,
            distance: 3.0,
            speed: 0.004,
            color: "#C0C0C0",
            tracerPositions: [],
            parent: "Saturn"
          }
        ]
      },
      {
        name: "Uranus",
        radius: 4.01,
        distance: 45,
        speed: 0.0000039,
        color: "#87CEEB",
        moons: [
          {
            name: "Titania",
            radius: 0.124,
            distance: 2.5,
            speed: 0.003,
            color: "#D3D3D3",
            tracerPositions: [],
            parent: "Uranus"
          },
          {
            name: "Oberon",
            radius: 0.119,
            distance: 3.0,
            speed: 0.002,
            color: "#A9A9A9",
            tracerPositions: [],
            parent: "Uranus"
          }
        ]
      },
      {
        name: "Neptune",
        radius: 3.88,
        distance: 55,
        speed: 0.000002,
        color: "#4682B4",
        moons: [
          {
            name: "Triton",
            radius: 0.212,
            distance: 2.8,
            speed: 0.003,
            color: "#B8860B",
            tracerPositions: [],
            parent: "Neptune"
          }
        ]
      }
    ],
    []
  );

  useEffect(() => {
    // Initialize Three.js components inside useEffect
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });

    if (rendererRef.current && cameraRef.current) {
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    }

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
    controls.enablePan = false; // Disable OrbitControls panning
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
    const sunLight = new THREE.PointLight(0xff4400, 10, 500); // Increased intensity and range
    scene.add(sunLight);

    // Add planets
    planets.forEach((planet) => {
      // Planet mesh
      const geometry = new THREE.SphereGeometry(planet.radius * 0.5, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          baseColor: { value: new THREE.Color(planet.color) },
          sunPosition: { value: new THREE.Vector3(0, 0, 0) } // Sun is at center
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

      // Add moons for each planet
      planet.moons.forEach((moon) => {
        // Moon mesh
        const moonGeometry = new THREE.SphereGeometry(moon.radius * 0.5, 32, 32);
        const moonMaterial = new THREE.ShaderMaterial({
          uniforms: {
            baseColor: { value: new THREE.Color(moon.color) },
            sunPosition: { value: new THREE.Vector3(0, 0, 0) }
          },
          vertexShader: planetVertexShader,
          fragmentShader: planetFragmentShader
        });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moonMesh);
        moon.mesh = moonMesh;

        // Moon orbit
        const moonOrbitGeometry = new THREE.BufferGeometry();
        const moonOrbitPoints: number[] = [];
        for (let i = 0; i <= 360; i++) {
          const angle = (i * Math.PI) / 180;
          moonOrbitPoints.push(Math.cos(angle) * moon.distance, 0, Math.sin(angle) * moon.distance);
        }
        moonOrbitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(moonOrbitPoints, 3));
        const moonOrbitMaterial = new THREE.LineBasicMaterial({
          color: 0x222222,
          transparent: true,
          opacity: 0.2
        });
        const moonOrbit = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
        moon.orbit = moonOrbit;

        // Create moon tracer
        const tracerGeometry = new THREE.BufferGeometry();
        const tracerMaterial = new THREE.PointsMaterial({
          color: moon.color,
          size: 0.05,
          transparent: true,
          opacity: 0.6
        });
        const tracer = new THREE.Points(tracerGeometry, tracerMaterial);
        moon.tracer = tracer;
        scene.add(tracer);
      });
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

        // Update moons
        planet.moons.forEach((moon) => {
          if (moon.mesh && planet.mesh) {
            const time = Date.now() * moon.speed;

            // Calculate moon position relative to its planet
            const moonX = Math.cos(time) * moon.distance;
            const moonZ = Math.sin(time) * moon.distance;

            // Add planet's position to get final moon position
            moon.mesh.position.x = planet.mesh.position.x + moonX;
            moon.mesh.position.z = planet.mesh.position.z + moonZ;

            // Update moon orbit position to follow planet
            if (moon.orbit) {
              moon.orbit.position.copy(planet.mesh.position);
            }

            // Update moon shader uniforms
            (moon.mesh.material as THREE.ShaderMaterial).uniforms.sunPosition.value.set(0, 0, 0);

            // Update tracer
            moon.tracerPositions.push(moon.mesh.position.x, moon.mesh.position.y, moon.mesh.position.z);

            // Keep only last 100 positions for the trailer
            const maxPoints = 100 * 3; // 3 values per point (x, y, z)
            if (moon.tracerPositions.length > maxPoints) {
              moon.tracerPositions = moon.tracerPositions.slice(-maxPoints);
            }

            // Update tracer geometry
            if (moon.tracer) {
              moon.tracer.geometry.setAttribute("position", new THREE.Float32BufferAttribute(moon.tracerPositions, 3));
            }
          }
        });
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
