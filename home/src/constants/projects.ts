export type ProjectCategory = "Math" | "3D" | "Music";

/**
 * Preview videos live in /public/projects/previews/<slug>.webm (+ .mp4 fallback).
 * To produce one: screen-record the project page (~8s, Cmd+Shift+5), then
 *   ffmpeg -i in.mov -t 6 -vf "scale=640:-2,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 38 -an public/projects/previews/<slug>.webm
 *   ffmpeg -i in.mov -t 6 -vf "scale=640:-2,fps=24" -c:v libx264 -crf 28 -an -movflags +faststart public/projects/previews/<slug>.mp4
 * Target ≤500KB each. Cards fall back to the static poster until the files exist.
 */
export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  category: ProjectCategory;
  tech: string[];
  /** Hover-play video preview; poster falls back to `image`. */
  preview?: { poster?: string; video?: string };
  /** Bento tile size: "lg" spans 2x2. */
  size?: "lg" | "sm";
}

export const PROJECTS: Project[] = [
  // Math & Simulations
  {
    slug: "penrose",
    title: "Penrose Tiling",
    description: "Interactive aperiodic tiling pattern generator",
    longDescription:
      "Generates aperiodic Penrose tilings that never repeat regardless of how far they extend. Explore different deflation levels and color schemes interactively.",
    image: "/projects/penrose-preview.png",
    category: "Math",
    tech: ["Three.js", "WebGL", "TypeScript"],
    preview: { video: "/projects/previews/penrose.webm" },
    size: "lg"
  },
  {
    slug: "mandelbrot",
    title: "Mandelbrot Set",
    description: "GPU-accelerated Mandelbrot set explorer",
    longDescription:
      "Explore the Mandelbrot set with smooth infinite zooming powered by GLSL fragment shaders running entirely on the GPU.",
    image: "/projects/mandelbrot-preview.png",
    category: "Math",
    tech: ["Three.js", "GLSL", "WebGL", "TypeScript"],
    preview: { video: "/projects/previews/mandelbrot.webm" },
    size: "lg"
  },
  {
    slug: "pendulum",
    title: "Double Pendulum",
    description: "Chaotic double pendulum simulation",
    longDescription:
      "Interactive double pendulum exhibiting chaotic behaviour. Control the simulation with your cursor and watch the trail trace complex paths.",
    image: "/projects/pendulum-preview.png",
    category: "Math",
    tech: ["Three.js", "Physics", "TypeScript"],
    preview: { video: "/projects/previews/pendulum.webm" }
  },
  {
    slug: "chladni",
    title: "Chladni Patterns",
    description: "Chladni plate vibration pattern visualizer",
    longDescription:
      "Visualizes the nodal patterns formed on vibrating plates. Adjust frequency mode numbers to reveal different standing wave geometries.",
    image: "/projects/chladni-preview.png",
    category: "Math",
    tech: ["Three.js", "WebGL", "GLSL", "TypeScript"],
    preview: { video: "/projects/previews/chladni.webm" }
  },
  {
    slug: "spirograph",
    title: "Spirograph",
    description: "Interactive spirograph / hypotrochoid simulator",
    longDescription:
      "Draws hypotrochoids and epitrochoids in real time. Tune the radii and offset to produce classic spirograph patterns or discover new ones.",
    image: "/projects/spiro-preview.png",
    category: "Math",
    tech: ["Three.js", "React", "TypeScript"],
    preview: { video: "/projects/previews/spirograph.webm" }
  },
  {
    slug: "life",
    title: "Game of Life",
    description: "Conway's Game of Life simulation",
    longDescription:
      "Conway's cellular automaton on a near-infinite sparse grid. Pan, zoom, stamp classic patterns, and watch emergent structures form.",
    image: "/projects/life-preview.png",
    category: "Math",
    tech: ["Canvas 2D", "TypeScript"],
    preview: { video: "/projects/previews/life.webm" }
  },
  // 3D Visualizations
  {
    slug: "solar",
    title: "Solar System",
    description: "Interactive 3D solar system model",
    longDescription:
      "A real-time 3D model of the solar system with accurate relative scales and orbital mechanics. Click any body to follow it.",
    image: "/projects/solar-preview.png",
    category: "3D",
    tech: ["Three.js", "React", "TypeScript"],
    preview: { video: "/projects/previews/solar.webm" },
    size: "lg"
  },
  {
    slug: "cube",
    title: "Cube Visualization",
    description: "3D cube with interactive controls",
    longDescription: "An interactive 3D cube rendered with Three.js. Rotate, zoom, and customize the rendering style.",
    image: "/projects/cube-preview.png",
    category: "3D",
    tech: ["Three.js", "React", "TypeScript"],
    preview: { video: "/projects/previews/cube.webm" }
  },
  {
    slug: "geometry",
    title: "Geometry",
    description: "Interactive 3D geometry explorer",
    longDescription:
      "Explore geometric shapes and transformations in an interactive 3D environment with step-by-step construction.",
    image: "",
    category: "3D",
    tech: ["Three.js", "TypeScript"]
  },
  // Music & Audio
  {
    slug: "waveform",
    title: "Waveform",
    description: "Real-time audio waveform visualizer",
    longDescription:
      "Captures your microphone input and renders the waveform in real time using the Web Audio API and Three.js.",
    image: "/projects/waveform-preview.png",
    category: "Music",
    tech: ["Three.js", "Web Audio API", "TypeScript"],
    preview: { video: "/projects/previews/waveform.webm" }
  },
  {
    slug: "butterchurn",
    title: "Butterchurn",
    description: "Milkdrop-style music visualizer",
    longDescription:
      "A WebGL port of the legendary Milkdrop visualizer. Reacts to microphone or line-in audio with GPU-rendered presets.",
    image: "/projects/butterchurn-preview.png",
    category: "Music",
    tech: ["WebGL", "Web Audio API", "TypeScript"],
    preview: { video: "/projects/previews/butterchurn.webm" }
  }
];

export const CATEGORY_META: Record<ProjectCategory, { label: string; description: string }> = {
  Math: {
    label: "Mathematics & Simulations",
    description: "Projects exploring mathematical concepts and physical simulations"
  },
  "3D": {
    label: "3D Visualizations",
    description: "Interactive 3D models and visualizations"
  },
  Music: {
    label: "Music & Audio",
    description: "Audio visualizations and music-related projects"
  }
};

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return PROJECTS.filter((p) => p.category === category);
}
