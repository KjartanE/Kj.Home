"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/constants/projects";

interface BentoCardProps {
  project: Project;
  className?: string;
}

export default function BentoCard({ project, className }: BentoCardProps) {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const poster = project.preview?.poster || project.image;
  const videoSrc = !reducedMotion && !videoFailed ? project.preview?.video : undefined;

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setPlaying(true))
      .catch(() => setVideoFailed(true));
  }, []);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  }, []);

  // Touch devices have no hover: play while the card is in view instead.
  useEffect(() => {
    if (!videoSrc || window.matchMedia("(hover: hover)").matches) return;
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : stop()), {
      threshold: 0.4
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [videoSrc, play, stop]);

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`h-full w-full ${className ?? ""}`}>
      <Link
        href={`/projects/${project.slug}`}
        className="group relative flex h-full min-h-44 w-full flex-col justify-end overflow-hidden rounded-xl border border-border/60 transition-colors hover:border-primary/50"
        onMouseEnter={videoSrc ? play : undefined}
        onMouseLeave={videoSrc ? stop : undefined}
        onFocus={videoSrc ? play : undefined}
        onBlur={videoSrc ? stop : undefined}>
        {/* Media layer */}
        <div className="absolute inset-0">
          {poster ? (
            <Image
              src={poster}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-muted via-background to-primary/20" />
          )}
          {videoSrc && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                playing ? "opacity-100" : "opacity-0"
              }`}>
              <source src={videoSrc} type="video/webm" />
              <source src={videoSrc.replace(/\.webm$/, ".mp4")} type="video/mp4" />
            </video>
          )}
          {/* Scrim for overlay legibility */}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/30 to-transparent" />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{project.category}</p>
          <h3 className="font-display mt-0.5 text-lg font-bold leading-tight">{project.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {project.tech.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="surface-glass text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
