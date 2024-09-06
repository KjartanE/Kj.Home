import { BlogPosts } from "app/components/posts"
import Blog from "./[slug]/page"

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Blog</h1>
      <div className="flex justify-between items-center mb-8">
        <BlogPosts />
        <Blog params={{ slug: "home" }} />
      </div>
    </section>
  )
}
