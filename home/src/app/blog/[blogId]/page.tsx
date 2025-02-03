import { getBlogPost, getBlogPosts } from "@/lib/mdx";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PenroseBackground from "@/components/penrose/PenroseBackground";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    blogId: post.slug
  }));
}

export default async function BlogPost({ params }: { params: { blogId: string } }) {
  const { frontmatter, content } = await getBlogPost(params.blogId);

  return (
    <>
      <PenroseBackground />
      <div className="container mx-auto max-w-7xl py-8 mt-14">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mb-8">
            <p className="text-muted-foreground">{frontmatter.publishedAt}</p>
            <h1 className="text-4xl font-bold tracking-tight">{frontmatter.title}</h1>
          </div>

          <Card>
            <CardContent className="prose prose-zinc dark:prose-invert pt-6">{content}</CardContent>
          </Card>
          <Link
            href="/blog"
            className="mb-4 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to posts
          </Link>
        </div>
      </div>
    </>
  );
}
