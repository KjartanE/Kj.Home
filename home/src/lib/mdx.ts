import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { evaluate } from "@mdx-js/mdx";
import * as jsxRuntime from "react/jsx-runtime";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Slugger from "github-slugger";

const rootDirectory = path.join(process.cwd(), "src/assets/blog");

export interface BlogFrontmatter {
  title: string;
  publishedAt: string;
  summary: string;
  tags?: string[];
  draft?: boolean;
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogPostMeta {
  slug: string;
  frontmatter: BlogFrontmatter;
  readingTime: number;
}

export function extractToc(content: string): TocEntry[] {
  const slugger = new Slugger();
  const lines = content.split("\n");
  const entries: TocEntry[] = [];

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    if (h2) {
      const text = h2[1].trim();
      entries.push({ id: slugger.slug(text), text, level: 2 });
    } else if (h3) {
      const text = h3[1].trim();
      entries.push({ id: slugger.slug(text), text, level: 3 });
    }
  }

  return entries;
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function getBlogPosts(): Promise<BlogPostMeta[]> {
  const files = fs.readdirSync(rootDirectory).filter((f) => f.endsWith(".mdx"));

  const posts: BlogPostMeta[] = files.map((filename) => {
    const filePath = path.join(rootDirectory, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);
    const frontmatter = data as BlogFrontmatter;

    return {
      slug: filename.replace(".mdx", ""),
      frontmatter,
      readingTime: calculateReadingTime(content)
    };
  });

  const isProduction = process.env.NODE_ENV === "production";

  return posts
    .filter((post) => !isProduction || !post.frontmatter.draft)
    .sort((a, b) => new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime());
}

export async function getBlogPost(slug: string) {
  const filePath = path.join(rootDirectory, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { data, content } = matter(fileContent);
  const frontmatter = data as BlogFrontmatter;

  const isDev = process.env.NODE_ENV === "development";
  const runtime = isDev ? jsxDevRuntime : jsxRuntime;

  const { default: MDXContent } = await evaluate(content, {
    ...runtime,
    development: isDev,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
  });

  return {
    frontmatter,
    content: MDXContent,
    readingTime: calculateReadingTime(content),
    toc: extractToc(content)
  };
}
