import { getBlogPosts } from "@/lib/mdx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <PersistentPenroseBackground />
      <h1 className="mb-2 text-3xl font-bold">Blog</h1>
      <p className="mb-8 text-muted-foreground">
        I write about my experiences and thoughts on software development, technology, and other topics.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug}>
            <Card className="h-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-muted/50">
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
  );
}
