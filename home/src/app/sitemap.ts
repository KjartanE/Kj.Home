import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.forritun.dev", changeFrequency: "monthly" as const, priority: 1 },
    { url: "https://www.forritun.dev/about", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://www.forritun.dev/projects", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://www.forritun.dev/projects/penrose", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/chladni", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/pendulum", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/spirograph", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/mandelbrot", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/life", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/cube", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/solar", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/waveform", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/butterchurn", changeFrequency: "monthly" as const },
    { url: "https://www.forritun.dev/projects/geometry", changeFrequency: "monthly" as const }
  ];
}
