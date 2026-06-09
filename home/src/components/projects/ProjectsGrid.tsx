"use client";

import { useState } from "react";
import { motion } from "motion/react";
import BentoCard from "@/components/projects/BentoCard";
import { CATEGORY_META, type Project, type ProjectCategory } from "@/constants/projects";

const ALL = "All" as const;
type FilterValue = typeof ALL | ProjectCategory;

const FILTERS: FilterValue[] = [ALL, "Math", "3D", "Music"];

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<FilterValue>(ALL);

  const filtered = active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <>
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
      <div className="grid grid-flow-dense auto-rows-[11rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((project) => (
          <motion.div key={project.slug} layout className={project.size === "lg" ? "sm:col-span-2 sm:row-span-2" : ""}>
            <BentoCard project={project} />
          </motion.div>
        ))}
      </div>
    </>
  );
}
