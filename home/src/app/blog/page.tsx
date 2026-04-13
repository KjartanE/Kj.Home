import { getBlogPosts } from "@/lib/mdx";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import BlogPostGrid from "@/components/blog/BlogPostGrid";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto mt-14 max-w-7xl px-4 py-8">
      <PersistentPenroseBackground />
      <h1 className="mb-2 text-3xl font-bold">Blog</h1>
      <p className="mb-8 text-muted-foreground">
        I write about my experiences and thoughts on software development, technology, and other topics.
      </p>
      <BlogPostGrid posts={posts} />
    </div>
  );
}
