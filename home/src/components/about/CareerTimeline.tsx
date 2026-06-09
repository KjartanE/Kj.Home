"use client";

import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import type { IHighlight } from "@/types";

export default function CareerTimeline({ highlights }: { highlights: IHighlight[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <ol className="relative space-y-10 border-l border-border/60 pl-6">
      {highlights.map((h, i) => (
        <motion.li
          key={`${h.org}-${h.start}`}
          className="relative"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}>
          <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
          <p className="font-mono text-xs text-muted-foreground">
            {h.start} – {h.end}
          </p>
          <h3 className="font-display mt-1 text-lg font-bold leading-tight">{h.role}</h3>
          <p className="text-sm text-muted-foreground">
            {h.org}
            {h.project && <span className="text-foreground/80"> · {h.project}</span>}
          </p>
          <p className="mt-2 text-sm">{h.summary}</p>
          {h.bullets && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {h.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            {h.tech.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
