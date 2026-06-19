"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import DecryptedText from "@/components/reactbits/DecryptedText";
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
        className="text-center font-display text-4xl font-bold tracking-tighter text-balance sm:text-6xl md:text-7xl">
        {reducedMotion ? (
          "Kjartan Einarsson"
        ) : (
          <DecryptedText
            text="Kjartan Einarsson"
            animateOn="view"
            sequential
            speed={50}
            maxIterations={12}
            revealDirection="start"
            encryptedClassName="text-primary/80"
          />
        )}
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
