import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

// Categories:
// - Math
// - 3D
// - Music

type ProjectCategory = "3D" | "Math" | "Music";

type Project = {
  title: string;
  description: string;
  image: string;
  link: string;
  tech?: string[];
  category: ProjectCategory;
};

// Define category metadata for more dynamic handling
type CategoryMetadata = {
  id: ProjectCategory;
  label: string;
  description?: string;
  priority: number; // For ordering categories
  icon?: React.ComponentType; // Optional icon component
};

// Category definitions with metadata
const categoryMetadata: CategoryMetadata[] = [
  {
    id: "Math",
    label: "Mathematics & Simulations",
    description: "Projects exploring mathematical concepts and simulations",
    priority: 1
  },
  {
    id: "3D",
    label: "3D Visualizations",
    description: "Interactive 3D models and visualizations",
    priority: 2
  },
  {
    id: "Music",
    label: "Music & Audio",
    description: "Audio visualizations and music-related projects",
    priority: 3
  }
];

// Organize projects by category
const projectsData: Record<ProjectCategory, Project[]> = {
  "Math": [
    {
      title: "Penrose Tiling",
      description: "Interactive Penrose tiling pattern generator",
      image: "/projects/penrose-preview.png",
      link: "/projects/penrose",
      tech: ["Three.js", "WebGL", "TypeScript"],
      category: "Math"
    },
    {
      title: "Chladni Patterns",
      description: "Visualization of Chladni plate vibration patterns",
      image: "/projects/chladni-preview.png",
      link: "/projects/chladni",
      tech: ["Three.js", "WebGL", "GLSL"],
      category: "Math"
    },
    {
      title: "Double Pendulum",
      description: "Interactive double pendulum simulation with cursor control",
      image: "/projects/pendulum-preview.png",
      link: "/projects/pendulum",
      tech: ["Three.js", "Physics", "TypeScript"],
      category: "Math"
    },
    {
      title: "Spirograph",
      description: "Interactive spirograph simulation",
      image: "/projects/spiro-preview.png",
      link: "/projects/spirograph",
      tech: ["Three.js", "React", "TypeScript"],
      category: "Math"
    },
    {
      title: "Mandelbrot Set",
      description: "Interactive Mandelbrot set visualization",
      image: "/projects/mandelbrot-preview.png",
      link: "/projects/mandelbrot",
      tech: ["Three.js", "WebGL", "TypeScript"],
      category: "Math"
    },
    {
      title: "Game of Life",
      description: "Interactive Game of Life simulation",
      image: "/projects/life-preview.png",
      link: "/projects/life",
      category: "Math"
    }
  ],
  "3D": [
    {
      title: "Cube Visualization",
      description: "3D cube rendering with interactive controls",
      image: "/projects/cube-preview.png",
      link: "/projects/cube",
      tech: ["Three.js", "React", "TypeScript"],
      category: "3D"
    },
    {
      title: "Solar System",
      description: "Interactive 3D solar system visualization",
      image: "/projects/solar-preview.png",
      link: "/projects/solar",
      tech: ["Three.js", "React", "TypeScript"],
      category: "3D"
    }
  ],
  "Music": [
    {
      title: "Waveform",
      description: "Interactive waveform visualization",
      image: "/projects/waveform-preview.png",
      link: "/projects/waveform",
      category: "Music"
    },
    {
      title: "Butterchurn",
      description: "Interactive butterchurn visualization",
      image: "/projects/butterchurn-preview.png",
      link: "/projects/butterchurn",
      category: "Music"
    }
  ]
};

// Helper functions for project management
const getProjectsByCategory = (category: ProjectCategory): Project[] => {
  return projectsData[category] || [];
};

const getCategoryMetadata = (categoryId: ProjectCategory): CategoryMetadata => {
  return categoryMetadata.find(cat => cat.id === categoryId) || {
    id: categoryId,
    label: categoryId,
    priority: 999
  };
};

// Get sorted categories based on priority
const getSortedCategories = (): ProjectCategory[] => {
  return categoryMetadata
    .sort((a, b) => a.priority - b.priority)
    .map(cat => cat.id);
};

const ProjectCard = ({ project }: { project: Project }) => (
  <Link href={project.link}>
    <Card className="h-full transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image src={project.image} alt={project.title} sizes="large" fill className="object-cover" priority />
        </div>
        <div className="flex flex-wrap gap-2">
          {project.tech?.map((tech) => (
            <span key={tech} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {tech}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function ProjectsPage() {
  const sortedCategories = getSortedCategories();

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Projects</h1>
      <p className="mb-8 text-muted-foreground">Here are some of the projects I&apos;ve worked on.</p>

      {sortedCategories.map((categoryId) => {
        const categoryProjects = getProjectsByCategory(categoryId);
        const metadata = getCategoryMetadata(categoryId);

        if (categoryProjects.length === 0) return null;

        return (
          <div key={categoryId} className="mb-12">
            <h2 className="mb-2 text-2xl font-semibold">{metadata.label}</h2>
            {metadata.description && (
              <p className="mb-6 text-muted-foreground">{metadata.description}</p>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryProjects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
