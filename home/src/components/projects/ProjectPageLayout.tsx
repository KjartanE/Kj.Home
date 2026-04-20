"use client";

import { useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getProject } from "@/constants/projects";
import { ChevronDown, ChevronUp, Maximize, Minimize } from "lucide-react";

interface ProjectPageLayoutProps {
  slug: string;
  children: React.ReactNode;
}

export default function ProjectPageLayout({ slug, children }: ProjectPageLayoutProps) {
  const project = getProject(slug);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0">
      {/* Visualization */}
      {children}

      {/* Floating info panel */}
      {project && (
        <div className="absolute bottom-4 left-4 z-20 w-72 max-w-[calc(100vw-2rem)]">
          {panelOpen && (
            <div className="mb-1 rounded-xl border border-border/40 bg-background/80 p-4 shadow-lg backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {project.category}
              </p>
              <h2 className="mt-1 text-base font-bold leading-tight">{project.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{project.description}</p>
              {project.tech.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.tech.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Controls row */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow backdrop-blur-md transition-colors hover:text-foreground">
              {panelOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              {panelOpen ? "Hide info" : project.title}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow backdrop-blur-md transition-colors hover:text-foreground">
              {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
              {isFullscreen ? "Exit" : "Fullscreen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
