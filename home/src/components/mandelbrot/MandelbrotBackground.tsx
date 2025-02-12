"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { MandelbrotControls } from "./MandelbrotControls";
import { ZoomIndicator } from "./ZoomIndicator";
import { NavigationControls } from "./NavigationControls";

const mandelbrotVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const mandelbrotFragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 vUv;
  uniform float zoom;
  uniform vec2 center;
  uniform vec2 screenSize;
  uniform float maxIterations;
  uniform float iterationScale;
  uniform float isDarkTheme;
  uniform vec3 backgroundColor;
  
  const float EPSILON = 1e-10;
  const float MAX_VALUE = 1e10;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  vec2 squareComplex(vec2 z) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
  }

  vec3 mandelbrot(vec2 c, float maxIterations) {
    vec2 z = vec2(0.0);
    float iterations = 0.0;
    
    // Early bailout optimization
    float cx2 = c.x * c.x;
    float cy2 = c.y * c.y;
    if ((cx2 + cy2) * ((cx2 - 2.0 * c.x + 1.0) + (cy2 + 1.0)) <= 0.0625) {
      return vec3(maxIterations, z);
    }
    
    for(float i = 0.0; i < 1000.0; i++) {
      if(i >= maxIterations) break;
      
      z = squareComplex(z) + c;
      
      // Enhanced escape conditions
      if(dot(z, z) > MAX_VALUE || dot(z, z) < EPSILON) {
        iterations = i;
        break;
      }
      
      if(dot(z, z) > 4.0) {
        iterations = i;
        break;
      }
      iterations = maxIterations;
    }
    
    return vec3(iterations, z);
  }
  
  // Double emulation functions
  vec2 ds_add(vec2 dsa, vec2 dsb) {
    float t1 = dsa.x + dsb.x;
    float e = t1 - dsa.x;
    float t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;
    return vec2(t1 + t2, t2 - (t1 + t2 - t1));
  }
  
  vec2 ds_mul(vec2 dsa, vec2 dsb) {
    float t1 = dsa.x * dsb.x;
    float e = t1 - dsa.x * dsb.x;
    float t2 = (((dsa.x * dsb.x - e) + dsa.x * dsb.y) + dsa.y * dsb.x) + dsa.y * dsb.y;
    return vec2(t1 + t2, t2 - (t1 + t2 - t1));
  }
  
  void main() {
    float pixelSize = 4.0 / (zoom * screenSize.x);
    vec2 c = (vUv * 4.0 - vec2(2.0)) / zoom + center;
    
    float dynamicIterations = min(maxIterations, iterationScale * (log(zoom + 1.0) + 1.0));
    
    vec3 result = mandelbrot(c, dynamicIterations);
    float iterations = result.x;
    vec2 z = result.yz;
    
    if (iterations == dynamicIterations) {
      gl_FragColor = vec4(backgroundColor, 1.0);
    } else {
      float smoothed = iterations + 1.0 - log(log(dot(z, z)) * 0.5) / log(2.0);
      
      float baseHue = isDarkTheme > 0.5 ? 0.68 : 0.38;
      float saturation = isDarkTheme > 0.5 ? 0.98 : 0.85;
      float value = isDarkTheme > 0.5 ? 
        (0.3 + sin(smoothed * 0.05) * 0.1) : 
        (0.5 + sin(smoothed * 0.05) * 0.2);
      
      if (mod(smoothed, 12.0) < 6.0) {
        value *= isDarkTheme > 0.5 ? 0.85 : 0.75;
        saturation *= 0.99;
      }
      
      vec3 color = hsv2rgb(vec3(baseHue + smoothed * 0.0005, saturation, value));
      gl_FragColor = vec4(color, 1.0);
    }
  }
`;

export default function MandelbrotBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const controlsRef = useRef<MandelbrotControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-1, 1, 1 / aspect, -1 / aspect, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2 / aspect);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        zoom: { value: 1.0 },
        center: { value: new THREE.Vector2(0.0, 0.0) },
        screenSize: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        maxIterations: { value: 2000.0 },
        iterationScale: { value: 100.0 },
        pixelSizeThreshold: { value: Number.EPSILON },
        isDarkTheme: { value: theme.resolvedTheme === "dark" ? 1.0 : 0.0 },
        backgroundColor: { value: new THREE.Color(theme.resolvedTheme === "dark" ? "#09090b" : "#ffffff") }
      },
      vertexShader: mandelbrotVertexShader,
      fragmentShader: mandelbrotFragmentShader
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Initialize controls with zoom callback
    const controls = new MandelbrotControls(material, renderer.domElement, aspect);
    controlsRef.current = controls;
    controls.onZoomChange = (zoom: number) => {
      setCurrentZoom(zoom);
    };
    controls.init();

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const newAspect = width / height;

      camera.left = -1;
      camera.right = 1;
      camera.top = 1 / newAspect;
      camera.bottom = -1 / newAspect;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      material.uniforms.screenSize.value.set(width, height);

      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(2, 2 / newAspect);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.cleanup();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme.resolvedTheme]);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0" />
      <NavigationControls
        onZoomIn={() => controlsRef.current?.zoomIn()}
        onZoomOut={() => controlsRef.current?.zoomOut()}
        onMove={(direction) => controlsRef.current?.move(direction)}
      />
      <ZoomIndicator zoom={currentZoom} />
    </>
  );
}
