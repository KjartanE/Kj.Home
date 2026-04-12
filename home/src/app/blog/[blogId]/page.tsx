import { getBlogPost, getBlogPosts } from "@/lib/mdx";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Metadata } from "next";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    blogId: post.slug
  }));
}

type Params = Promise<{ blogId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { blogId } = await params;
  const { frontmatter } = await getBlogPost(blogId);

  return {
    title: frontmatter.title,
    description: frontmatter.summary,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.summary,
      type: "article",
      publishedTime: frontmatter.publishedAt,
      url: `https://kjhome.dev/blog/${blogId}`
    },
    twitter: {
      card: "summary",
      title: frontmatter.title,
      description: frontmatter.summary
    }
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { blogId } = await params;
  const { frontmatter, content: MDXContent, readingTime } = await getBlogPost(blogId);

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            <Link
              href="/blog"
              className="mb-4 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {format(new Date(frontmatter.publishedAt), "MMM d, yyyy")}
            </Link>
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{frontmatter.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{readingTime} min read</p>
        </div>

        <Card>
          <CardContent className="prose prose-zinc pt-6 dark:prose-invert"><MDXContent /></CardContent>
        </Card>
        <Link
          href="/blog"
          className="mb-4 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to posts
        </Link>
      </div>
    </div>
  );
}
