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

    const id = setInterval(cyclePhrase, 3000);
    return () => clearInterval(id);
  }, [phrases]);

  return (
    <p
      className="mt-4 max-w-[42rem] text-center text-muted-foreground sm:text-xl transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {phrases[index]}
    </p>
  );
}
