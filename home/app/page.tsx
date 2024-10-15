import { title, subtitle } from "@/components/primitives";
import PenroseLSystemRenderer from "./tiles/PenroseLSystemRenderer";

export default function Home() {
  return (
    <section className="flex h-5/6 flex-col items-center justify-center gap-4 py-8">
      <div className="flex justify-center">
        <PenroseLSystemRenderer />
      </div>
      <div className="inline-block max-w-xl justify-center text-center z-20">
        <span className={title()}>Kjartan Einarsson</span>
        <br />
        <div className={subtitle({ class: "mt-4" })}>
          {`
            hi,
            
            this is my website. I like to build things.
            
            wanted to start tracking some of my projects and thoughts to share with others.
            `}
        </div>
      </div>
    </section>
  );
}
