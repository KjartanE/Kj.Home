"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import AnimatedSubtitle from "./AnimatedSubtitle";

interface HeroProps {
  phrases: string[];
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Hero({ phrases }: HeroProps) {
  const reducedMotion = useReducedMotion();

  const content = (
    <>
      <motion.h1
        variants={item}
        className="font-display text-balance text-center text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
        Kjartan Einarsson
      </motion.h1>

      <motion.div variants={item}>
        <AnimatedSubtitle phrases={phrases} />
      </motion.div>

      <motion.div variants={item} className="mt-8 flex flex-wrap justify-center gap-4">
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
      </motion.div>
    </>
  );

  return (
    <motion.div
      variants={container}
      initial={reducedMotion ? false : "hidden"}
      animate="show"
      className="container mx-auto flex flex-col items-center justify-center px-4">
      {content}
    </motion.div>
  );
}
