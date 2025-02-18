import { Button } from "@/components/ui/button";
import Link from "next/link";
// main page
export default function Home() {
  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] items-center overflow-hidden">
        <div className="container mx-auto flex flex-col items-center justify-center px-4">
          <h1 className="text-balance text-center text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            Kjartan Einarsson
          </h1>

          <p className="mt-4 max-w-[42rem] text-center text-muted-foreground sm:text-xl">
            I like to code. Welcome to my collection of projects and experiments.
          </p>

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
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-full">
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
