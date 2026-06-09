"use client";

import { useState } from "react";
import { motion } from "motion/react";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import BentoCard from "@/components/projects/BentoCard";
import { PROJECTS, CATEGORY_META, type ProjectCategory } from "@/constants/projects";

const ALL = "All" as const;
type FilterValue = typeof ALL | ProjectCategory;

const FILTERS: FilterValue[] = [ALL, "Math", "3D", "Music"];

export default function ProjectsPage() {
  const [active, setActive] = useState<FilterValue>(ALL);

  const filtered = active === ALL ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <PersistentPenroseBackground />

      <h1 className="font-display mb-2 text-3xl font-bold tracking-tight">Projects</h1>
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
      <div className="grid auto-rows-[11rem] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((project) => (
          <motion.div
            key={project.slug}
            layout
            className={project.size === "lg" ? "sm:col-span-2 sm:row-span-2" : ""}>
            <BentoCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
