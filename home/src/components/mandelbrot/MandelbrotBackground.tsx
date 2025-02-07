"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const mandelbrotVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const mandelbrotFragmentShader = `
  varying vec2 vUv;
  uniform float zoom;
  uniform vec2 center;
  
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  vec2 squareComplex(vec2 z) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
  }
  
  void main() {
    vec2 c = (vUv * 4.0 - vec2(2.0)) / zoom + center;
    vec2 z = vec2(0.0);
    
    float iterations = 0.0;
    const float maxIterations = 200.0;
    
    for(float i = 0.0; i < maxIterations; i++) {
      z = squareComplex(z) + c;
      if(length(z) > 2.0) {
        iterations = i;
        break;
      }
      iterations = maxIterations;
    }
    
    if (iterations == maxIterations) {
      // Deep indigo for the main set
      gl_FragColor = vec4(0.01, 0.0, 0.05, 1.0);
    } else {
      float smoothed = iterations + 1.0 - log(log(length(z))) / log(2.0);
      
      // Create an indigo to yellow gradient
      float baseHue = 0.68; // indigo base
      float hue = baseHue + smoothed * 0.0005; // Smaller variation for more consistent color
      float saturation = 0.98;
      float value = 0.3 + sin(smoothed * 0.05) * 0.1; // Gentler brightness variation
      //increase purple and yellow
      
      // Subtle color bands
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
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

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
        center: { value: new THREE.Vector2(0.0, 0.0) }
      },
      vertexShader: mandelbrotVertexShader,
      fragmentShader: mandelbrotFragmentShader
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let currentZoom = 1.0;

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx = event.clientX - lastMousePosRef.current.x;
      const dy = event.clientY - lastMousePosRef.current.y;

      // Convert screen pixels to Mandelbrot coordinate space
      const scaleFactor = 2.0 / (currentZoom * window.innerWidth);
      const moveX = -dx * scaleFactor;
      const moveY = dy * scaleFactor;

      material.uniforms.center.value.x += moveX;
      material.uniforms.center.value.y += moveY;

      lastMousePosRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const mandelbrotX = (x * 2.0) / currentZoom + material.uniforms.center.value.x;
      const mandelbrotY = (y * 2.0 / aspect) / currentZoom + material.uniforms.center.value.y;
      
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = currentZoom * zoomFactor;
      
      const newCenterX = mandelbrotX - (x * 2.0) / newZoom;
      const newCenterY = mandelbrotY - (y * 2.0 / aspect) / newZoom;
      
      currentZoom = newZoom;
      material.uniforms.zoom.value = currentZoom;
      material.uniforms.center.value.set(newCenterX, newCenterY);
    };

    renderer.domElement.addEventListener("wheel", handleWheel);
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mouseleave", handleMouseUp);

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

      // Update plane geometry to match new aspect ratio
      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(2, 2/newAspect);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("mouseleave", handleMouseUp);
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
