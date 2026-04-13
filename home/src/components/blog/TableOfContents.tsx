"use client";

import { useEffect, useRef, useState } from "react";
import type { TocEntry } from "@/lib/mdx";

interface TableOfContentsProps {
  entries: TocEntry[];
}

export default function TableOfContents({ entries }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (entries.length === 0) return;

    const headingEls = entries
      .map((e) => document.getElementById(e.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="space-y-1 text-sm">
      <p className="mb-3 font-semibold text-foreground">On this page</p>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className={[
            "block truncate transition-colors",
            entry.level === 3 ? "pl-3" : "",
            activeId === entry.id
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          ].join(" ")}>
          {entry.text}
        </a>
      ))}
    </nav>
  );
}
