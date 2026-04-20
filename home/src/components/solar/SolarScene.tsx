"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PLANETS } from "./bodies";
import { auToScene, dateToJD, heliocentricAU } from "./kepler";
import type { PlanetDef } from "./types";

interface SolarSceneProps {
  epoch: Date;
  daysPerSecond: number;
  paused: boolean;
  showOrbits: boolean;
  focusedBody: string | null;
  onHover: (name: string | null) => void;
  onSelect: (name: string | null) => void;
  onTimeChange: (date: Date) => void;
}

// Visual scale: sun radius in scene units.
const SUN_RADIUS = 3;

const coronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const coronaFragmentShader = `
  uniform vec3 color;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - abs(dot(vNormal, vViewDir));
    float f = pow(rim, 2.3) * intensity;
    gl_FragColor = vec4(color * f, f);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 color;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - abs(dot(vNormal, vViewDir));
    float f = pow(rim, 4.0) * 1.1;
    gl_FragColor = vec4(color * f, f);
  }
`;

function makeStarTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeStarfield(): THREE.Points {
  const count = 3500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // uniform sphere sampling
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = 700 + Math.random() * 100;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const tint = 0.7 + Math.random() * 0.3;
    colors[i * 3] = tint;
    colors[i * 3 + 1] = tint;
    colors[i * 3 + 2] = tint * (0.9 + Math.random() * 0.1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.8,
    map: makeStarTexture(),
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: false
  });
  return new THREE.Points(geo, mat);
}

function makeSun(): { group: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  group.name = "Sun";
  group.userData.body = "Sun";

  // Photosphere: emissive sphere, texture via canvas noise for surface variation.
  const texCanvas = document.createElement("canvas");
  texCanvas.width = 512;
  texCanvas.height = 256;
  const ctx = texCanvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, "#ffb347");
  grad.addColorStop(0.5, "#ffe27a");
  grad.addColorStop(1, "#ffb347");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 6;
    const a = 0.05 + Math.random() * 0.15;
    ctx.fillStyle = `rgba(255, ${140 + Math.random() * 80}, ${40 + Math.random() * 40}, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const sunTex = new THREE.CanvasTexture(texCanvas);
  sunTex.colorSpace = THREE.SRGBColorSpace;

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS, 64, 32),
    new THREE.MeshBasicMaterial({ map: sunTex })
  );
  core.name = "Sun";
  core.userData.body = "Sun";
  group.add(core);

  // Inner corona
  const innerCoronaMat = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color("#ffcf5a") },
      intensity: { value: 1.4 }
    },
    vertexShader: coronaVertexShader,
    fragmentShader: coronaFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide
  });
  const innerCorona = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS * 1.15, 64, 32), innerCoronaMat);
  group.add(innerCorona);

  // Outer corona — much larger, fades further
  const outerCoronaMat = innerCoronaMat.clone();
  outerCoronaMat.uniforms = {
    color: { value: new THREE.Color("#ff8a2a") },
    intensity: { value: 0.8 }
  };
  const outerCorona = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS * 1.7, 64, 32), outerCoronaMat);
  group.add(outerCorona);

  // Flare sprite for lens-like glow
  const flareCanvas = document.createElement("canvas");
  flareCanvas.width = 256;
  flareCanvas.height = 256;
  const fctx = flareCanvas.getContext("2d")!;
  const fg = fctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  fg.addColorStop(0, "rgba(255, 220, 140, 1)");
  fg.addColorStop(0.2, "rgba(255, 170, 60, 0.5)");
  fg.addColorStop(0.6, "rgba(255, 100, 30, 0.1)");
  fg.addColorStop(1, "rgba(255, 80, 20, 0)");
  fctx.fillStyle = fg;
  fctx.fillRect(0, 0, 256, 256);
  const flareTex = new THREE.CanvasTexture(flareCanvas);
  const flareMat = new THREE.SpriteMaterial({
    map: flareTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const flare = new THREE.Sprite(flareMat);
  flare.scale.set(SUN_RADIUS * 5, SUN_RADIUS * 5, 1);
  group.add(flare);

  return {
    group,
    dispose: () => {
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      sunTex.dispose();
      innerCorona.geometry.dispose();
      innerCoronaMat.dispose();
      outerCorona.geometry.dispose();
      outerCoronaMat.dispose();
      flareTex.dispose();
      flareMat.dispose();
    }
  };
}

function makePlanetTexture(baseColor: string, seed: number): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 128);
  // Simple banded/mottled shading using seed for variety
  const rand = (() => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })();
  for (let i = 0; i < 400; i++) {
    const x = rand() * 256;
    const y = rand() * 128;
    const r = 4 + rand() * 18;
    const alpha = 0.05 + rand() * 0.2;
    const light = rand() > 0.5;
    ctx.fillStyle = light ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeRingTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.15, "rgba(210,190,150,0.9)");
  grad.addColorStop(0.35, "rgba(200,170,120,0.6)");
  grad.addColorStop(0.45, "rgba(0,0,0,0)"); // Cassini division
  grad.addColorStop(0.55, "rgba(220,200,170,0.85)");
  grad.addColorStop(0.8, "rgba(180,150,110,0.5)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface PlanetInstance {
  def: PlanetDef;
  group: THREE.Group;
  tiltGroup: THREE.Group;
  planetMesh: THREE.Mesh;
  moons: Array<{
    name: string;
    group: THREE.Group;
    mesh: THREE.Mesh;
    displayDistance: number;
    periodSec: number;
  }>;
  orbitLine?: THREE.Line;
  dispose: () => void;
}

function buildPlanet(def: PlanetDef): PlanetInstance {
  const group = new THREE.Group();
  group.name = def.name;

  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = (def.facts.tiltDeg * Math.PI) / 180;
  group.add(tiltGroup);

  const tex = makePlanetTexture(def.color, def.name.charCodeAt(0) * 137 + def.name.length);
  const material = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.85,
    metalness: 0.0
  });
  const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(def.displayRadius, 48, 24), material);
  planetMesh.name = def.name;
  planetMesh.userData.body = def.name;
  tiltGroup.add(planetMesh);

  const disposers: Array<() => void> = [
    () => planetMesh.geometry.dispose(),
    () => material.dispose(),
    () => tex.dispose()
  ];

  // Rings
  if (def.hasRings) {
    const inner = def.displayRadius * 1.3;
    const outer = def.displayRadius * 2.2;
    const ringGeo = new THREE.RingGeometry(inner, outer, 96);
    // Remap UVs so a 1D radial gradient stretches across the ring
    const pos = ringGeo.attributes.position as THREE.BufferAttribute;
    const uv = ringGeo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const t = (r - inner) / (outer - inner);
      uv.setXY(i, t, 0.5);
    }
    uv.needsUpdate = true;

    const ringTex = makeRingTexture();
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    tiltGroup.add(ring);
    disposers.push(() => {
      ringGeo.dispose();
      ringMat.dispose();
      ringTex.dispose();
    });
  }

  // Earth atmosphere halo
  if (def.name === "Earth") {
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color("#6aa6ff") } },
      vertexShader: coronaVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(def.displayRadius * 1.08, 48, 24), atmoMat);
    tiltGroup.add(atmo);
    disposers.push(() => {
      atmo.geometry.dispose();
      atmoMat.dispose();
    });
  }

  // Moons
  const moons = def.moons.map((m) => {
    const moonGroup = new THREE.Group();
    moonGroup.name = `${def.name}/${m.name}-pivot`;
    group.add(moonGroup);

    const mtex = makePlanetTexture(m.color, m.name.charCodeAt(0) * 91);
    const mmat = new THREE.MeshStandardMaterial({ map: mtex, roughness: 0.95, metalness: 0 });
    const mmesh = new THREE.Mesh(new THREE.SphereGeometry(m.displayRadius, 24, 12), mmat);
    mmesh.name = m.name;
    mmesh.userData.body = m.name;
    mmesh.position.x = m.displayDistance;
    moonGroup.add(mmesh);
    disposers.push(() => {
      mmesh.geometry.dispose();
      mmat.dispose();
      mtex.dispose();
    });

    return {
      name: m.name,
      group: moonGroup,
      mesh: mmesh,
      displayDistance: m.displayDistance,
      periodSec: m.displayPeriodSec
    };
  });

  return {
    def,
    group,
    tiltGroup,
    planetMesh,
    moons,
    dispose: () => disposers.forEach((d) => d())
  };
}

function buildOrbitLine(def: PlanetDef, jd: number): THREE.Line {
  // Sample the planet's orbit at the current epoch by stepping mean longitude
  // around the full ellipse while freezing the secular rates.
  const N = 256;
  const positions = new Float32Array((N + 1) * 3);
  for (let i = 0; i <= N; i++) {
    const frac = i / N;
    const fakeElements = { ...def.elements, L: def.elements.L + frac * 360, LDot: 0 };
    const au = heliocentricAU(fakeElements, jd);
    const scene = auToScene(au.x, au.y, au.z);
    positions[i * 3] = scene.x;
    positions[i * 3 + 1] = scene.y;
    positions[i * 3 + 2] = scene.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0x4a5070, transparent: true, opacity: 0.35 });
  return new THREE.Line(geo, mat);
}

export default function SolarScene({
  epoch,
  daysPerSecond,
  paused,
  showOrbits,
  focusedBody,
  onHover,
  onSelect,
  onTimeChange
}: SolarSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable refs so the RAF loop sees the latest values without rebuild.
  const propsRef = useRef({ epoch, daysPerSecond, paused, showOrbits, focusedBody });
  propsRef.current = { epoch, daysPerSecond, paused, showOrbits, focusedBody };
  const callbacksRef = useRef({ onHover, onSelect, onTimeChange });
  callbacksRef.current = { onHover, onSelect, onTimeChange };

  // Sim-clock: the simulated Date drifts from `epoch` by daysPerSecond over wall time.
  const simStateRef = useRef({ baseEpochMs: epoch.getTime(), elapsedSimDays: 0, lastEpochRef: epoch.getTime() });

  // When the epoch prop changes, reset sim clock.
  useEffect(() => {
    simStateRef.current.baseEpochMs = epoch.getTime();
    simStateRef.current.elapsedSimDays = 0;
    simStateRef.current.lastEpochRef = epoch.getTime();
  }, [epoch]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060d);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 28, 52);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6;
    controls.maxDistance = 400;
    controls.target.set(0, 0, 0);

    // Starfield
    const stars = makeStarfield();
    scene.add(stars);

    // Sun
    const sun = makeSun();
    scene.add(sun.group);

    // Ambient fill so dark sides aren't pure black
    scene.add(new THREE.AmbientLight(0xffffff, 0.08));
    const sunLight = new THREE.PointLight(0xffeecc, 2.2, 0, 0);
    sun.group.add(sunLight);

    // Planets
    const instances: PlanetInstance[] = PLANETS.map((def) => {
      const inst = buildPlanet(def);
      scene.add(inst.group);
      return inst;
    });

    // Orbit lines computed at the provided epoch
    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);
    const rebuildOrbits = (jd: number) => {
      while (orbitsGroup.children.length) {
        const c = orbitsGroup.children[0];
        orbitsGroup.remove(c);
        if (c instanceof THREE.Line) {
          c.geometry.dispose();
          (c.material as THREE.Material).dispose();
        }
      }
      instances.forEach((inst) => {
        const line = buildOrbitLine(inst.def, jd);
        inst.orbitLine = line;
        orbitsGroup.add(line);
      });
    };
    rebuildOrbits(dateToJD(epoch));

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoverName: string | null = null;

    // Collect pickable meshes (planets + moons + sun)
    const pickables: THREE.Object3D[] = [sun.group.children[0]]; // core sphere
    instances.forEach((inst) => {
      pickables.push(inst.planetMesh);
      inst.moons.forEach((m) => pickables.push(m.mesh));
    });

    const pick = (event: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      if (!hits.length) return null;
      const h = hits[0].object;
      return (h.userData.body as string | undefined) ?? null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const name = pick(e);
      if (name !== hoverName) {
        hoverName = name;
        callbacksRef.current.onHover(name);
        renderer.domElement.style.cursor = name ? "pointer" : "default";
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      // Ignore drags from OrbitControls — OrbitControls fires 'change' during drag; we use a small click threshold.
      const startX = e.clientX;
      const startY = e.clientY;
      const handleUp = (up: PointerEvent) => {
        window.removeEventListener("pointerup", handleUp);
        const dx = up.clientX - startX;
        const dy = up.clientY - startY;
        if (dx * dx + dy * dy < 16) {
          const name = pick(up);
          callbacksRef.current.onSelect(name);
        }
      };
      window.addEventListener("pointerup", handleUp);
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // Animation loop
    let rafId = 0;
    let lastMs = performance.now();

    const animate = () => {
      const now = performance.now();
      const dtSec = Math.min(0.1, (now - lastMs) / 1000);
      lastMs = now;

      const props = propsRef.current;
      if (!props.paused) {
        simStateRef.current.elapsedSimDays += dtSec * props.daysPerSecond;
      }
      const simMs = simStateRef.current.baseEpochMs + simStateRef.current.elapsedSimDays * 86400000;
      const simDate = new Date(simMs);
      const jd = dateToJD(simDate);

      // Report time (throttled by rAF cadence)
      callbacksRef.current.onTimeChange(simDate);

      // Sun rotation
      sun.group.rotation.y += dtSec * 0.05;

      // Planets
      instances.forEach((inst) => {
        const au = heliocentricAU(inst.def.elements, jd);
        const pos = auToScene(au.x, au.y, au.z);
        inst.group.position.set(pos.x, pos.y, pos.z);

        // Axial spin — visual-only. Tied to wall time (not sim time) so fast
        // orbital speeds don't make planets strobe. Still uses real rotation
        // ratios so Jupiter spins faster than Earth; negative = retrograde.
        const rotHours = inst.def.facts.rotationHours;
        if (rotHours !== 0 && !props.paused) {
          // Reference: Earth (24h) makes one rotation per ~8 wall-seconds at 1×.
          // Light sqrt scaling with sim speed keeps things lively without strobing.
          const speedBoost = Math.sqrt(Math.max(1, props.daysPerSecond));
          const radPerSec = ((2 * Math.PI) / 8) * (24 / rotHours) * speedBoost;
          inst.planetMesh.rotation.y += radPerSec * dtSec;
        }

        // Moons: circular orbit parameterized by sim time, not real Kepler.
        inst.moons.forEach((m) => {
          const theta = (simStateRef.current.elapsedSimDays / m.periodSec) * 2 * Math.PI + m.name.charCodeAt(0) * 0.37; // phase offset so moons don't stack
          m.mesh.position.set(Math.cos(theta) * m.displayDistance, 0, Math.sin(theta) * m.displayDistance);
        });
      });

      // Orbit visibility
      orbitsGroup.visible = props.showOrbits;

      // Focus camera on selected body (smooth lerp)
      if (props.focusedBody) {
        let target: THREE.Vector3 | null = null;
        if (props.focusedBody === "Sun") {
          target = new THREE.Vector3(0, 0, 0);
        } else {
          const planet = instances.find((p) => p.def.name === props.focusedBody);
          if (planet) {
            target = planet.group.position.clone();
          } else {
            // Maybe a moon — find its parent and compute world position
            for (const p of instances) {
              const m = p.moons.find((mm) => mm.name === props.focusedBody);
              if (m) {
                target = new THREE.Vector3();
                m.mesh.getWorldPosition(target);
                break;
              }
            }
          }
        }
        if (target) {
          controls.target.lerp(target, 0.08);
        }
      }

      controls.update();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      instances.forEach((i) => i.dispose());
      sun.dispose();
      (stars.geometry as THREE.BufferGeometry).dispose();
      (stars.material as THREE.Material).dispose();
      while (orbitsGroup.children.length) {
        const c = orbitsGroup.children[0];
        orbitsGroup.remove(c);
        if (c instanceof THREE.Line) {
          c.geometry.dispose();
          (c.material as THREE.Material).dispose();
        }
      }
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
    // We intentionally do not include props in deps — the effect sets up once and
    // reads current values via propsRef/callbacksRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
