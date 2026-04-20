export type ProjectCategory = "Math" | "3D" | "Music";

export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  category: ProjectCategory;
  tech: string[];
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
    tech: ["Three.js", "WebGL", "TypeScript"]
  },
  {
    slug: "mandelbrot",
    title: "Mandelbrot Set",
    description: "GPU-accelerated Mandelbrot set explorer",
    longDescription:
      "Explore the Mandelbrot set with smooth infinite zooming powered by GLSL fragment shaders running entirely on the GPU.",
    image: "/projects/mandelbrot-preview.png",
    category: "Math",
    tech: ["Three.js", "GLSL", "WebGL", "TypeScript"]
  },
  {
    slug: "pendulum",
    title: "Double Pendulum",
    description: "Chaotic double pendulum simulation",
    longDescription:
      "Interactive double pendulum exhibiting chaotic behaviour. Control the simulation with your cursor and watch the trail trace complex paths.",
    image: "/projects/pendulum-preview.png",
    category: "Math",
    tech: ["Three.js", "Physics", "TypeScript"]
  },
  {
    slug: "chladni",
    title: "Chladni Patterns",
    description: "Chladni plate vibration pattern visualizer",
    longDescription:
      "Visualizes the nodal patterns formed on vibrating plates. Adjust frequency mode numbers to reveal different standing wave geometries.",
    image: "/projects/chladni-preview.png",
    category: "Math",
    tech: ["Three.js", "WebGL", "GLSL", "TypeScript"]
  },
  {
    slug: "spirograph",
    title: "Spirograph",
    description: "Interactive spirograph / hypotrochoid simulator",
    longDescription:
      "Draws hypotrochoids and epitrochoids in real time. Tune the radii and offset to produce classic spirograph patterns or discover new ones.",
    image: "/projects/spiro-preview.png",
    category: "Math",
    tech: ["Three.js", "React", "TypeScript"]
  },
  {
    slug: "life",
    title: "Game of Life",
    description: "Conway's Game of Life simulation",
    longDescription:
      "Conway's cellular automaton on a near-infinite sparse grid. Pan, zoom, stamp classic patterns, and watch emergent structures form.",
    image: "/projects/life-preview.png",
    category: "Math",
    tech: ["Canvas 2D", "TypeScript"]
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
    tech: ["Three.js", "React", "TypeScript"]
  },
  {
    slug: "cube",
    title: "Cube Visualization",
    description: "3D cube with interactive controls",
    longDescription:
      "An interactive 3D cube rendered with Three.js. Rotate, zoom, and customize the rendering style.",
    image: "/projects/cube-preview.png",
    category: "3D",
    tech: ["Three.js", "React", "TypeScript"]
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
    tech: ["Three.js", "Web Audio API", "TypeScript"]
  },
  {
    slug: "butterchurn",
    title: "Butterchurn",
    description: "Milkdrop-style music visualizer",
    longDescription:
      "A WebGL port of the legendary Milkdrop visualizer. Reacts to microphone or line-in audio with GPU-rendered presets.",
    image: "/projects/butterchurn-preview.png",
    category: "Music",
    tech: ["WebGL", "Web Audio API", "TypeScript"]
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
