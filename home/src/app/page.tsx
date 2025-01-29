import PenroseLSystemRenderer from "../pages/penrose/components/PenroseLSystemRenderer";

export default function Home() {
  return (
    <section className="flex h-5/6 flex-col items-center justify-center gap-4 py-8">
      <div className="flex justify-center">
        <PenroseLSystemRenderer />
      </div>
      <div className="z-20 inline-block max-w-xl justify-center text-center">
        <span className="">Kjartan Einarsson</span>
        <br />
        <div className="">
          {`
            hi,ASD
            
            this is my website. I like to build things.
            
            wanted to start tracking some of my projects and thoughts to share with others.
            `}
        </div>
      </div>
    </section>
  );
}
