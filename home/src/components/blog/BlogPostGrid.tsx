"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPostMeta } from "@/lib/mdx";

interface BlogPostGridProps {
  posts: BlogPostMeta[];
}

export default function BlogPostGrid({ posts }: BlogPostGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))).sort();

  const filtered = activeTag ? posts.filter((p) => p.frontmatter.tags?.includes(activeTag)) : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
              <Badge variant={activeTag === tag ? "default" : "outline"}>{tag}</Badge>
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug}>
            <Card className="h-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{post.frontmatter.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{format(new Date(post.frontmatter.publishedAt), "MMM d, yyyy")}</span>
                  <span>&middot;</span>
                  <span>{post.readingTime} min read</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.frontmatter.summary}</p>
                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.frontmatter.tags.map((tag) => (
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
    </>
  );
}
