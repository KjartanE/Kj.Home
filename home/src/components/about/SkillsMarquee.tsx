"use client";

import LogoLoop, { type LogoItem } from "@/components/reactbits/LogoLoop";

// Curated subset of the existing /public/svg icon sets, weighted to Kjartan's actual stack.
// Rendered as uniform white silhouettes (via the className filter below) so brand logos that ship
// with dark fills (Next.js, Express, …) stay legible on the near-black background.
const logos: LogoItem[] = [
  { src: "/svg/language/typescript.svg", title: "TypeScript", alt: "TypeScript" },
  { src: "/svg/library/react.svg", title: "React", alt: "React" },
  { src: "/svg/framework/vue.svg", title: "Vue", alt: "Vue" },
  { src: "/svg/framework/next.svg", title: "Next.js", alt: "Next.js" },
  { src: "/svg/framework/vite.svg", title: "Vite", alt: "Vite" },
  { src: "/svg/framework/tailwind.svg", title: "Tailwind CSS", alt: "Tailwind CSS" },
  { src: "/svg/language/python.svg", title: "Python", alt: "Python" },
  { src: "/svg/library/node.svg", title: "Node.js", alt: "Node.js" },
  { src: "/svg/framework/express.svg", title: "Express", alt: "Express" },
  { src: "/svg/framework/fast-api.svg", title: "FastAPI", alt: "FastAPI" },
  { src: "/svg/database/postgres.svg", title: "PostgreSQL", alt: "PostgreSQL" },
  { src: "/svg/database/mongodb.svg", title: "MongoDB", alt: "MongoDB" },
  { src: "/svg/info/docker.svg", title: "Docker", alt: "Docker" },
  { src: "/svg/deployment/kubernetes.svg", title: "Kubernetes", alt: "Kubernetes" },
  { src: "/svg/deployment/helm.svg", title: "Helm", alt: "Helm" },
  { src: "/svg/deployment/openshift.svg", title: "OpenShift", alt: "OpenShift" },
  { src: "/svg/deployment/aws.svg", title: "AWS", alt: "AWS" },
  { src: "/svg/deployment/azure.svg", title: "Azure", alt: "Azure" },
  { src: "/svg/library/three.svg", title: "Three.js", alt: "Three.js" },
  { src: "/svg/software/git.svg", title: "Git", alt: "Git" }
];

export default function SkillsMarquee() {
  return (
    <LogoLoop
      logos={logos}
      speed={40}
      logoHeight={30}
      gap={56}
      pauseOnHover
      scaleOnHover
      fadeOut
      fadeOutColor="var(--background)"
      ariaLabel="Tech stack and tools"
      className="py-2 [&_img]:opacity-55 [&_img]:[filter:brightness(0)_invert(1)] [&_img]:transition-opacity [&_img]:duration-300 [&_li:hover_img]:opacity-100"
    />
  );
}
