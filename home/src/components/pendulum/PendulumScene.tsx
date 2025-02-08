"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { ThreeCleanup } from "@/lib/three/cleanup";
import { tracerVertexShader, tracerFragmentShader } from "./shaders/tracer";
import { Controls } from "./Controls";

class Pendulum {
  private scene: THREE.Scene;
  private arm1: THREE.Line;
  private arm2: THREE.Line;
  private joint1: THREE.Mesh;
  private joint2: THREE.Mesh;
  private bob: THREE.Mesh;
  private armLength: number;
  private angle1: number = Math.PI / 4;
  private angle2: number = Math.PI / 4;
  private velocity1: number = 0;
  private velocity2: number = 0;
  private gravity: number = 981;
  private damping: number = 0.999;
  private isGrabbed: boolean = true;
  private mouse: THREE.Vector2;
  private mass1: number = 1;
  private mass2: number = 1;
  private tracer1: THREE.Points;
  private tracer2: THREE.Points;
  private tracerPositions1: THREE.Vector3[] = [];
  private tracerPositions2: THREE.Vector3[] = [];
  private tracerAlphas1: number[] = [];
  private tracerAlphas2: number[] = [];
  private maxTracerPoints = 1000;
  private tracerFadeRate: number = 0.99;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mouse = new THREE.Vector2();
    this.armLength = Math.min(window.innerWidth, window.innerHeight - 128) / 5;

    // Create geometries and materials
    const jointGeometry = new THREE.SphereGeometry(this.armLength * 0.05);
    const hingeGeometry = new THREE.RingGeometry(
      this.armLength * 0.04, // inner radius
      this.armLength * 0.05, // outer radius
      32 // segments
    );

    // Create materials
    const joint1Material = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff6b6b") });
    const joint2Material = new THREE.MeshBasicMaterial({ color: new THREE.Color("#4ecdc4") });
    const hingeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    const armMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    // Create joints
    this.joint1 = new THREE.Mesh(jointGeometry, joint1Material);
    this.joint2 = new THREE.Mesh(jointGeometry, joint2Material);
    this.bob = new THREE.Mesh(jointGeometry, joint2Material);

    // Create hinge (origin point) as a line ring instead of a mesh
    const hinge = new THREE.LineLoop(hingeGeometry, hingeMaterial);
    this.scene.add(hinge);
    hinge.position.set(0, 0, 0);

    // Create arms
    this.arm1 = new THREE.Line(new THREE.BufferGeometry(), armMaterial);
    this.arm2 = new THREE.Line(new THREE.BufferGeometry(), armMaterial);

    // Add to scene
    this.scene.add(this.joint1);
    this.scene.add(this.joint2);
    this.scene.add(this.bob);
    this.scene.add(this.arm1);
    this.scene.add(this.arm2);

    // Create tracers with different colors
    const tracerGeometry1 = new THREE.BufferGeometry();
    const tracerGeometry2 = new THREE.BufferGeometry();

    const tracerMaterial1 = new THREE.ShaderMaterial({
      vertexShader: tracerVertexShader,
      fragmentShader: tracerFragmentShader,
      uniforms: {
        color: { value: new THREE.Color("#ff6b6b") }
      },
      transparent: true,
      depthWrite: false
    });

    const tracerMaterial2 = new THREE.ShaderMaterial({
      vertexShader: tracerVertexShader,
      fragmentShader: tracerFragmentShader,
      uniforms: {
        color: { value: new THREE.Color("#4ecdc4") }
      },
      transparent: true,
      depthWrite: false
    });

    this.tracer1 = new THREE.Points(tracerGeometry1, tracerMaterial1);
    this.tracer2 = new THREE.Points(tracerGeometry2, tracerMaterial2);
    this.scene.add(this.tracer1);
    this.scene.add(this.tracer2);

    this.updatePositions();
  }

  private updatePositions() {
    if (!this.bob || !this.joint1 || !this.joint2) return;

    let x1, y1, x2, y2;

    if (this.isGrabbed) {
      // When grabbed, point arms directly at mouse
      const mouseAngle = Math.atan2(this.mouse.y, this.mouse.x);

      // First joint is halfway to mouse
      x1 = this.armLength * Math.cos(mouseAngle);
      y1 = this.armLength * Math.sin(mouseAngle);

      // Second joint is at mouse position (maintaining arm length)
      x2 = 2 * this.armLength * Math.cos(mouseAngle);
      y2 = 2 * this.armLength * Math.sin(mouseAngle);

      // Store angles for physics simulation when released
      // Convert from mouse angle to pendulum angle coordinate system
      this.angle1 = mouseAngle + Math.PI / 2; // This is the key change
      this.angle2 = this.angle1; // Both arms aligned when grabbed

      // Reset velocities
      this.velocity1 = 0;
      this.velocity2 = 0;
    } else {
      // Normal pendulum physics
      x1 = this.armLength * Math.sin(this.angle1);
      y1 = -this.armLength * Math.cos(this.angle1);

      x2 = x1 + this.armLength * Math.sin(this.angle2);
      y2 = y1 - this.armLength * Math.cos(this.angle2);
    }

    // Update positions
    this.joint1.position.set(x1, y1, 0);
    this.joint2.position.set(x2, y2, 0);
    this.bob.position.set(x2, y2, 0);

    // Update arms
    const arm1Points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x1, y1, 0)];
    const arm2Points = [new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)];

    this.arm1.geometry.setFromPoints(arm1Points);
    this.arm2.geometry.setFromPoints(arm2Points);

    // Add tracer points when not grabbed
    if (!this.isGrabbed) {
      this.tracerPositions1.unshift(new THREE.Vector3(x1, y1, 0));
      this.tracerAlphas1.unshift(1.0);

      this.tracerPositions2.unshift(new THREE.Vector3(x2, y2, 0));
      this.tracerAlphas2.unshift(1.0);
    }
  }

  private updateTracers() {
    // Add new positions
    this.tracerPositions1.unshift(new THREE.Vector3(this.joint1.position.x, this.joint1.position.y, 0));
    this.tracerPositions2.unshift(new THREE.Vector3(this.bob.position.x, this.bob.position.y, 0));

    // Add new alphas
    this.tracerAlphas1.unshift(1.0);
    this.tracerAlphas2.unshift(1.0);

    // Limit array sizes
    if (this.tracerPositions1.length > this.maxTracerPoints) {
      this.tracerPositions1.pop();
      this.tracerAlphas1.pop();
    }
    if (this.tracerPositions2.length > this.maxTracerPoints) {
      this.tracerPositions2.pop();
      this.tracerAlphas2.pop();
    }

    // Update fade rate
    for (let i = 0; i < this.tracerAlphas1.length; i++) {
      this.tracerAlphas1[i] *= this.tracerFadeRate;
      this.tracerAlphas2[i] *= this.tracerFadeRate;
    }

    // Update geometries
    const positions1 = new Float32Array(this.tracerPositions1.length * 3);
    const positions2 = new Float32Array(this.tracerPositions2.length * 3);
    const alphas1 = new Float32Array(this.tracerAlphas1);
    const alphas2 = new Float32Array(this.tracerAlphas2);

    this.tracerPositions1.forEach((pos, i) => {
      positions1[i * 3] = pos.x;
      positions1[i * 3 + 1] = pos.y;
      positions1[i * 3 + 2] = pos.z;
    });

    this.tracerPositions2.forEach((pos, i) => {
      positions2[i * 3] = pos.x;
      positions2[i * 3 + 1] = pos.y;
      positions2[i * 3 + 2] = pos.z;
    });

    this.tracer1.geometry.setAttribute("position", new THREE.BufferAttribute(positions1, 3));
    this.tracer1.geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas1, 1));
    this.tracer2.geometry.setAttribute("position", new THREE.BufferAttribute(positions2, 3));
    this.tracer2.geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas2, 1));
  }

  update(deltaTime: number) {
    if (!this.isGrabbed) {
      // Physics simulation
      const dt = deltaTime / 1000; // Convert to seconds

      // Double pendulum physics equations
      const g = this.gravity;
      const l = this.armLength;
      const m1 = this.mass1;
      const m2 = this.mass2;
      const a1 = this.angle1;
      const a2 = this.angle2;
      const v1 = this.velocity1;

      // Calculate accelerations using the full double pendulum equations
      const num1 = -g * (2 * m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2);
      const den1 = l * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
      const acc1 = num1 / den1;

      const num2 = 2 * Math.sin(a1 - a2) * (v1 * v1 * l * (m1 + m2) + g * (m1 + m2) * Math.cos(a1));
      const den2 = l * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
      const acc2 = num2 / den2;

      // Update velocities and angles
      this.velocity1 += acc1 * dt;
      this.velocity2 += acc2 * dt;

      // Apply damping
      this.velocity1 *= this.damping;
      this.velocity2 *= this.damping;

      // Update angles
      this.angle1 += this.velocity1 * dt;
      this.angle2 += this.velocity2 * dt;
    }

    this.updatePositions();
    this.updateTracers();
  }

  setMousePosition(x: number, y: number) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  setGrabbed(grabbed: boolean) {
    this.isGrabbed = grabbed;
    if (grabbed) {
      // Clear tracers when grabbed
      this.tracerPositions1 = [];
      this.tracerPositions2 = [];
      this.tracerAlphas1 = [];
      this.tracerAlphas2 = [];
      this.updateTracers();
    }
  }

  setGravity(gravity: number) {
    this.gravity = gravity;
  }

  setDamping(damping: number) {
    this.damping = damping;
  }

  setTracerColors(color1: string, color2: string) {
    (this.tracer1.material as THREE.ShaderMaterial).uniforms.color.value = new THREE.Color(color1);
    (this.tracer2.material as THREE.ShaderMaterial).uniforms.color.value = new THREE.Color(color2);

    // Update joint colors
    (this.joint1.material as THREE.MeshBasicMaterial).color = new THREE.Color(color1);
    (this.joint2.material as THREE.MeshBasicMaterial).color = new THREE.Color(color2);
    (this.bob.material as THREE.MeshBasicMaterial).color = new THREE.Color(color2);
  }

  setTracerLength(length: number) {
    this.maxTracerPoints = length;
    // Trim existing tracers if needed
    while (this.tracerPositions1.length > length) {
      this.tracerPositions1.pop();
      this.tracerAlphas1.pop();
      this.tracerPositions2.pop();
      this.tracerAlphas2.pop();
    }
  }

  setTracerFade(fadeTime: number) {
    // Convert fade time in seconds to per-frame fade rate
    // Assuming 60 FPS, calculate rate that gives desired fade time
    this.tracerFadeRate = Math.pow(0.001, 1 / (fadeTime * 60));
  }

  updateThemeColors(isDark: boolean) {
    const themeColor = isDark ? 0xffffff : 0x000000;
    // Update arm colors
    (this.arm1.material as THREE.LineBasicMaterial).color.setHex(themeColor);
    (this.arm2.material as THREE.LineBasicMaterial).color.setHex(themeColor);

    // Update hinge color (find the LineLoop in scene children)
    const hinge = this.scene.children.find((child): child is THREE.LineLoop => child instanceof THREE.LineLoop);
    if (hinge) {
      (hinge.material as THREE.LineBasicMaterial).color.setHex(themeColor);
    }
  }

  // Add method to update arm length when window resizes
  updateArmLength() {
    this.armLength = Math.min(window.innerWidth, window.innerHeight - 128) / 5;
    this.updatePositions();
  }
}

const PendulumScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendulumRef = useRef<Pendulum | null>(null);
  const animationFrameId = useRef<number>(null);

  const theme = useTheme();

  const initialControlValues = {
    gravity: 981,
    damping: 0.999,
    color1: "#ff6b6b",
    color2: "#4ecdc4",
    tracerLength: 2000,
    tracerFade: 5
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current; // Store ref value

    let isPageVisible = true;
    let lastTime: number | null = null;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.resolvedTheme === "dark" ? "#09090b" : "#ffffff");

    // Create camera with dynamic aspect ratio
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    camera.position.y = 0;
    camera.position.z = 100;

    // Create renderer with full size
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const pendulum = new Pendulum(scene);
    pendulumRef.current = pendulum;

    // Update colors when theme changes
    pendulum.updateThemeColors(theme.resolvedTheme === "dark");

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.left = width / -2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = height / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      pendulum.updateArmLength();
    };
    window.addEventListener("resize", handleResize);

    const animate = (time: number) => {
      if (!isPageVisible) {
        lastTime = null;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = lastTime ? time - lastTime : 0;
      lastTime = time;

      pendulum.update(deltaTime);
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Event listeners
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = -(event.clientY - (rect.top + rect.height / 2));
      pendulum.setMousePosition(x, y);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = -(event.clientY - (rect.top + rect.height / 2));
      pendulum.setMousePosition(x, y);
      pendulum.setGrabbed(true);
    };

    const handleMouseUp = () => {
      pendulum.setGrabbed(false);
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);

    // Visibility change handler
    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (isPageVisible) {
        lastTime = null; // Reset lastTime to prevent large delta on resume
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start animation
    const animationId = requestAnimationFrame(animate);

    // Add resize cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);

      ThreeCleanup.disposeScene(scene);
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme.resolvedTheme]);

  return (
    <div className="relative">
      <Controls
        initialValues={{
          ...initialControlValues
        }}
        onGravityChange={(value) => pendulumRef.current?.setGravity(value)}
        onDampingChange={(value) => pendulumRef.current?.setDamping(value)}
        onColorChange={(color1, color2) => pendulumRef.current?.setTracerColors(color1, color2)}
        onTracerLengthChange={(value) => pendulumRef.current?.setTracerLength(value)}
        onTracerFadeChange={(value) => pendulumRef.current?.setTracerFade(value)}
      />
      <div ref={containerRef} className="fixed inset-0 mt-14" />
    </div>
  );
};

export default PendulumScene;
