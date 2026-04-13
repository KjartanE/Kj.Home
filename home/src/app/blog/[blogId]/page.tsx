import { getBlogPost, getBlogPosts } from "@/lib/mdx";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Metadata } from "next";
import TableOfContents from "@/components/blog/TableOfContents";

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
  const { frontmatter, content: MDXContent, readingTime, toc } = await getBlogPost(blogId);

  const posts = await getBlogPosts();
  const currentIndex = posts.findIndex((p) => p.slug === blogId);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <div className="mx-auto max-w-3xl xl:mx-0 xl:grid xl:max-w-none xl:grid-cols-[1fr_240px] xl:gap-12">
        {/* Main content */}
        <div className="space-y-6">
          <div className="mb-8">
            <Link
              href="/blog"
              className="mb-4 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {format(new Date(frontmatter.publishedAt), "MMM d, yyyy")}
            </Link>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">{frontmatter.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{readingTime} min read</p>
          </div>

          <Card>
            <CardContent className="prose prose-zinc pt-6 dark:prose-invert"><MDXContent /></CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to posts
            </Link>

            {(prevPost || nextPost) && (
              <div className="flex justify-between gap-4 border-t pt-4">
                <div className="flex-1">
                  {prevPost && (
                    <Link
                      href={`/blog/${prevPost.slug}`}
                      className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{prevPost.frontmatter.title}</span>
                    </Link>
                  )}
                </div>
                <div className="flex-1 text-right">
                  {nextPost && (
                    <Link
                      href={`/blog/${nextPost.slug}`}
                      className="inline-flex items-center justify-end gap-2 text-muted-foreground transition-colors hover:text-foreground">
                      <span className="line-clamp-1">{nextPost.frontmatter.title}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky ToC sidebar (xl+) */}
        {toc.length > 0 && (
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <TableOfContents entries={toc} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
