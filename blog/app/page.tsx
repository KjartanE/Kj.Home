// import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Kjartan Einarsson
      </h1>
      <p className="whitespace-pre-wrap">
        {`
        hi,
        
        this is my website. I like to build things.
        
        wanted to start tracking some of my projects and thoughts to share with others.
        `}
      </p>
      {/* <div className="my-8">
        <BlogPosts />
        </div> */}
    </section>
  )
}
