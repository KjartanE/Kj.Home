import Blog from "./[slug]/page";

import { BlogPosts } from "@/components/posts";
import { title } from "@/components/primitives";

export default function BlogPage() {
  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={title()}>My Blog</h1>
          <BlogPosts />
        </div>
        <Blog params={{ slug: "home" }} />
      </div>
    </section>
  );
}
