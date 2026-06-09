import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import AnimatedSubtitle from "@/components/home/AnimatedSubtitle";
import FadeIn from "@/components/home/FadeIn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="font-display text-balance text-center text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            Kjartan Einarsson
          </h1>

          <AnimatedSubtitle phrases={SUBTITLE_PHRASES} />

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/projects">
              <Button size="lg" className="rounded-full">
                Current Projects
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="secondary" className="rounded-full">
                About Me
              </Button>
            </Link>
            <a href="mailto:kjartanreinarsson@gmail.com">
              <Button size="lg" variant="outline" className="rounded-full">
                Get in touch
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Below-fold sections */}
      <div className="container mx-auto max-w-7xl space-y-20 px-4 pb-24">
        {/* Featured Projects */}
        <FadeIn>
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
            <div className="grid gap-6 md:grid-cols-3">
              {FEATURED_PROJECTS.map((project) => (
                <Link href={`/projects/${project.slug}`} key={project.slug}>
                  <Card className="h-full bg-background/80 backdrop-blur-xs transition-colors hover:bg-muted/50">
                    <CardHeader className="pb-3">
                      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
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
              ))}
            </div>
          </div>
        </FadeIn>

      </div>
    </>
  );
}
