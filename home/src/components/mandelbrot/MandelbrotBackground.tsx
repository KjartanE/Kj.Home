"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { MandelbrotControls } from "./MandelbrotControls";

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
  #endif

  varying vec2 vUv;
  uniform float zoom;
  uniform vec2 center;
  uniform vec2 screenSize;
  
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
    
    for(float i = 0.0; i < 2000.0; i++) {
      if(i >= maxIterations) break;
      
      z = squareComplex(z) + c;
      if(length(z) > 2.0) {
        iterations = i;
        break;
      }
      iterations = maxIterations;
    }
    
    return vec3(iterations, z);
  }
  
  void main() {
    // Calculate pixel size in Mandelbrot space
    float pixelSize = 4.0 / (zoom * screenSize.x);
    
    // Adjust detail level based on zoom
    float maxIterations = min(2000.0, 200.0 * log(zoom + 1.0));
    
    // Calculate Mandelbrot coordinates with higher precision
    vec2 c = (vUv * 4.0 - vec2(2.0)) / zoom + center;
    
    vec3 result = mandelbrot(c, maxIterations);
    float iterations = result.x;
    vec2 z = result.yz;
    
    if (iterations == maxIterations) {
      gl_FragColor = vec4(0.01, 0.0, 0.05, 1.0);
    } else {
      float smoothed = iterations + 1.0 - log(log(length(z))) / log(2.0);
      
      float baseHue = 0.68;
      float hue = baseHue + smoothed * 0.0005;
      float saturation = 0.98;
      float value = 0.3 + sin(smoothed * 0.05) * 0.1;
      
      if (mod(smoothed, 12.0) < 6.0) {
        value *= 0.85;
        saturation *= 0.99;
      }
      
      vec3 color = hsv2rgb(vec3(hue, saturation, value));
      gl_FragColor = vec4(color, 1.0);
    }
  }
`;

export default function MandelbrotBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -1, 1,
      1/aspect, -1/aspect,
      0.1, 10
    );
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2/aspect);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        zoom: { value: 1.0 },
        center: { value: new THREE.Vector2(0.0, 0.0) },
        screenSize: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: mandelbrotVertexShader,
      fragmentShader: mandelbrotFragmentShader
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Initialize controls
    const controls = new MandelbrotControls(material, renderer.domElement, aspect);
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
      camera.top = 1/newAspect;
      camera.bottom = -1/newAspect;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      material.uniforms.screenSize.value.set(width, height);

      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(2, 2/newAspect);
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

  return <div ref={containerRef} className="fixed inset-0" />;
}
