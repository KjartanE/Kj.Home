import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ICreativeProject } from "@/types";

export default function CreativeSection({ projects }: { projects: ICreativeProject[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {projects.map((p) => {
        const inner = (
          <>
            <h3 className="flex items-center justify-between gap-2 font-display text-base leading-tight font-bold">
              {p.title}
              {p.href && (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              )}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          </>
        );

        return p.href ? (
          <Link
            key={p.title}
            href={p.href}
            className="group rounded-xl surface-solid p-4 transition-colors hover:border-primary/50">
            {inner}
          </Link>
        ) : (
          <div key={p.title} className="rounded-xl surface-solid p-4">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
