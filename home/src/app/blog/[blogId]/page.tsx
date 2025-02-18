import { getBlogPost, getBlogPosts } from "@/lib/mdx";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Frontmatter {
  title: string;
  publishedAt: string;
  [key: string]: any; // Allow additional properties
}

interface BlogPost {
  frontmatter: Frontmatter;
  content: React.ReactNode;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    blogId: post.slug
  }));
}

type Params = Promise<{ blogId: string }>;

export default async function BlogPage({ params }: { params: Params }) {
  const { blogId } = await params;

  const rawPost = await getBlogPost(blogId);
  const post = {
    frontmatter: rawPost.frontmatter as Frontmatter,
    content: rawPost.content
  } satisfies BlogPost;
  const { frontmatter, content } = post;

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            <Link
              href="/blog"
              className="mb-4 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {frontmatter.publishedAt}
            </Link>
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{frontmatter.title}</h1>
        </div>

        <Card>
          <CardContent className="prose prose-zinc pt-6 dark:prose-invert">{content}</CardContent>
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
