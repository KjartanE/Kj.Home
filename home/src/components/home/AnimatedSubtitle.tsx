"use client";

import { useEffect, useState } from "react";

interface AnimatedSubtitleProps {
  phrases: string[];
}

export default function AnimatedSubtitle({ phrases }: AnimatedSubtitleProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (phrases.length <= 1) return;

    const cyclePhrase = () => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        // Fade in
        setVisible(true);
      }, 400);
    };

    const id = setInterval(cyclePhrase, 12000);
    return () => clearInterval(id);
  }, [phrases]);

  return (
    <p
      className="duration-800 mt-4 max-w-[48rem] text-center text-muted-foreground transition-opacity sm:text-xl"
      style={{ opacity: visible ? 1 : 0 }}>
      {phrases[index]}
    </p>
  );
}
