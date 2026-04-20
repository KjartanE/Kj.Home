"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import { PROJECTS, CATEGORY_META, type ProjectCategory, type Project } from "@/constants/projects";

const ALL = "All" as const;
type FilterValue = typeof ALL | ProjectCategory;

const FILTERS: FilterValue[] = [ALL, "Math", "3D", "Music"];

function ProjectCard({ project, large }: { project: Project; large?: boolean }) {
  return (
    <Link href={`/projects/${project.slug}`} className={large ? "md:col-span-2" : ""}>
      <Card className="group h-full bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-muted/50 hover:shadow-lg">
        <CardHeader className="pb-3">
          {(project.image || large) && (
            <div className={`relative mb-3 overflow-hidden rounded-lg ${large ? "aspect-[21/9]" : "aspect-video"}`}>
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes={large ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                  No preview
                </div>
              )}
            </div>
          )}
          <CardTitle className={large ? "text-xl" : "text-lg"}>{project.title}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {project.tech.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ProjectsPage() {
  const [active, setActive] = useState<FilterValue>(ALL);

  const filtered = active === ALL ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  const [featured, ...rest] = filtered;

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <PersistentPenroseBackground />

      <h1 className="mb-2 text-3xl font-bold">Projects</h1>
      <p className="mb-6 text-muted-foreground">Interactive visualizations, simulations, and experiments.</p>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            ].join(" ")}>
            {f === ALL ? "All" : CATEGORY_META[f].label}
          </button>
        ))}
      </div>

      {/* Bento grid */}
      {featured && (
        <div className="grid gap-6 md:grid-cols-3">
          <ProjectCard project={featured} large />
          {rest.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
