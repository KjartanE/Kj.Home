import { title, subtitle } from "@/components/primitives";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl justify-center text-center">
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

      {/* <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow"
          })}
          href={siteConfig.links.docs}>
          Documentation
        </Link>
      </div> */}
    </section>
  );
}
