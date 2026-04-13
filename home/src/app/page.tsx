import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import AnimatedSubtitle from "@/components/home/AnimatedSubtitle";
import FadeIn from "@/components/home/FadeIn";
import { getBlogPosts } from "@/lib/mdx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

const SUBTITLE_PHRASES = [
  "I like to code. Welcome to my collection of projects and experiments.",
  "Creative coding, interactive visualizations, and building useful software.",
  "Exploring math, physics, and audio through the browser."
];

type FeaturedProject = {
  title: string;
  description: string;
  image: string;
  link: string;
  tech: string[];
};

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    title: "Penrose Tiling",
    description: "Interactive aperiodic tiling pattern generator built with Three.js and WebGL.",
    image: "/projects/penrose-preview.png",
    link: "/projects/penrose",
    tech: ["Three.js", "WebGL", "TypeScript"]
  },
  {
    title: "Mandelbrot Set",
    description: "GPU-accelerated Mandelbrot set explorer with smooth zooming.",
    image: "/projects/mandelbrot-preview.png",
    link: "/projects/mandelbrot",
    tech: ["Three.js", "GLSL", "TypeScript"]
  },
  {
    title: "Double Pendulum",
    description: "Chaotic double pendulum simulation with cursor control and trail rendering.",
    image: "/projects/pendulum-preview.png",
    link: "/projects/pendulum",
    tech: ["Three.js", "Physics", "TypeScript"]
  }
];

export default async function Home() {
  const posts = await getBlogPosts();
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <PersistentPenroseBackground />

      {/* Hero — full viewport */}
      <div className="flex h-[calc(100vh-3.5rem)] items-center overflow-hidden">
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="text-balance text-center text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
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
                <h2 className="text-2xl font-bold">Featured Projects</h2>
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
                <Link href={project.link} key={project.title}>
                  <Card className="h-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted/50">
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

        {/* Latest Blog Posts */}
        <FadeIn>
          <div>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">Latest Posts</h2>
                <p className="mt-1 text-muted-foreground">Thoughts on software, hardware, and everything in between.</p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                All posts <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {latestPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug}>
                  <Card className="h-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{post.frontmatter.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{format(new Date(post.frontmatter.publishedAt), "MMM d, yyyy")}</span>
                        <span>&middot;</span>
                        <span>{post.readingTime} min read</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{post.frontmatter.summary}</p>
                      {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.frontmatter.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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
