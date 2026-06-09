import Link from "next/link";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import Hero from "@/components/home/Hero";
import Reveal from "@/components/home/Reveal";
import BentoCard from "@/components/projects/BentoCard";
import { ArrowRight } from "lucide-react";
import { PROJECTS } from "@/constants/projects";

const SUBTITLE_PHRASES = [
  "I like to code. Welcome to my collection of projects and experiments.",
  "Creative coding, interactive visualizations, and building useful software.",
  "Exploring math, physics, and audio through the browser."
];

const FEATURED_SLUGS = ["penrose", "mandelbrot", "pendulum"];
const FEATURED_PROJECTS = FEATURED_SLUGS.map((slug) => PROJECTS.find((p) => p.slug === slug)!).filter(Boolean);

export default function Home() {
  return (
    <>
      <PersistentPenroseBackground />

      {/* Hero — full viewport */}
      <div className="flex h-[calc(100vh-3.5rem)] items-center overflow-hidden">
        <Hero phrases={SUBTITLE_PHRASES} />
      </div>

      {/* Below-fold sections */}
      <div className="container mx-auto max-w-7xl space-y-20 px-4 pb-24">
        {/* Featured Projects */}
        <Reveal>
          <div>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">Featured Projects</h2>
                <p className="mt-1 text-muted-foreground">A selection of interactive visualizations.</p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                All projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid auto-rows-[11rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_PROJECTS.map((project, i) => (
                <div key={project.slug} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : "sm:col-span-2"}>
                  <BentoCard project={project} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </>
  );
}
