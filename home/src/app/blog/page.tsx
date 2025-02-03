"use client"

import { getBlogPosts } from "@/lib/mdx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import PenroseLSystemRenderer from "@/components/penrose/PenroseLSystemRenderer";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <div className="fixed inset-0 z-100">
        <PenroseLSystemRenderer />
      </div>
      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-8 mt-14">
        <h1 className="mb-2 text-3xl font-bold">Blog</h1>
        <p className="mb-8 text-muted-foreground">
          I write about my experiences and thoughts on software development, technology, and other topics.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <Card className="h-full transition-colors hover:bg-muted/50 backdrop-blur-sm bg-background/80">
                <CardHeader>
                  <CardTitle>{post.frontmatter.title}</CardTitle>
                  <CardDescription>{post.frontmatter.publishedAt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.frontmatter.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
