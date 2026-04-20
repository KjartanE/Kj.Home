import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/mdx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const blogEntries = posts.map((post) => ({
    url: `https://kjhome.dev/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.publishedAt),
    changeFrequency: "monthly" as const
  }));

  const staticRoutes = [
    { url: "https://kjhome.dev", changeFrequency: "monthly" as const, priority: 1 },
    { url: "https://kjhome.dev/about", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://kjhome.dev/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { url: "https://kjhome.dev/projects", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://kjhome.dev/projects/penrose", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/chladni", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/pendulum", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/spirograph", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/mandelbrot", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/life", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/cube", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/solar", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/waveform", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/butterchurn", changeFrequency: "monthly" as const },
    { url: "https://kjhome.dev/projects/geometry", changeFrequency: "monthly" as const }
  ];

  return [...staticRoutes, ...blogEntries];
}
