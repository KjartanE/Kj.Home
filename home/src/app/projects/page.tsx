import type { Metadata } from "next";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { getProjectsWithPreviews } from "@/lib/previews";

export const metadata: Metadata = {
  title: "Projects",
  description: "Interactive visualizations, simulations, and experiments by Kjartan Einarsson."
};

export default function ProjectsPage() {
  const projects = getProjectsWithPreviews();

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <PersistentPenroseBackground />

      <h1 className="mb-2 font-display text-3xl font-bold tracking-tight">Projects</h1>
      <p className="mb-6 text-muted-foreground">Interactive visualizations, simulations, and experiments.</p>

      <ProjectsGrid projects={projects} />
    </div>
  );
}
