import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

const projects = [
  {
    title: "Cube Visualization",
    description: "3D cube rendering with interactive controls",
    image: "/projects/cube-preview.png",
    link: "/projects/cube",
    tech: ["Three.js", "React", "TypeScript"]
  },
  {
    title: "Penrose Tiling",
    description: "Interactive Penrose tiling pattern generator",
    image: "/projects/penrose-preview.png",
    link: "/projects/penrose",
    tech: ["Three.js", "WebGL", "TypeScript"]
  },
  {
    title: "Chladni Patterns",
    description: "Visualization of Chladni plate vibration patterns",
    image: "/projects/chladni-preview.png",
    link: "/projects/chladni",
    tech: ["Three.js", "WebGL", "GLSL"]
  },
  {
    title: "Double Pendulum",
    description: "Interactive double pendulum simulation with cursor control",
    image: "/projects/pendulum-preview.png",
    link: "/projects/pendulum",
    tech: ["Three.js", "Physics", "TypeScript"]
  },
  {
    title: "Solar System",
    description: "Interactive 3D solar system visualization",
    image: "/projects/solar-preview.png",
    link: "/projects/solar",
    tech: ["Three.js", "React", "TypeScript"]
  },
];

export default function ProjectsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 mt-14">
      <h1 className="mb-2 text-3xl font-bold">Projects</h1>
      <p className="mb-8 text-muted-foreground">
        Here are some of the projects I&apos;ve worked on.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link href={project.link} key={project.title}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image src={project.image} alt={project.title} fill className="object-cover" priority />
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
