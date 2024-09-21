export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center" style={{ height: "75vh" }}>
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
    </div>
  )
}
