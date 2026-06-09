import Image from "next/image";
import { Download, Github, Linkedin, Mail, MapPin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IPersonal } from "@/types";

const RESUME_PDF = "/resume/Kjartan-Einarsson-Resume.pdf";

export default function BioHeader({ personal }: { personal: IPersonal }) {
  return (
    <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <Image
        src="/images/clancy.png"
        alt={personal.name}
        width={120}
        height={120}
        className="rounded-2xl border border-border/60"
        priority
      />
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{personal.name}</h1>
        <p className="mt-1 text-primary">{personal.title}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {personal.location}
        </p>
      </div>
    </section>
  );
}

export function BioActions({ personal }: { personal: IPersonal }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm">
        <a href={RESUME_PDF} download>
          <Download /> Download Resume
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`mailto:${personal.email}`}>
          <Mail /> Email
        </a>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="GitHub">
        <a href={personal.github} target="_blank" rel="noopener noreferrer">
          <Github />
        </a>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="LinkedIn">
        <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin />
        </a>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="YouTube">
        <a href={personal.youtube} target="_blank" rel="noopener noreferrer">
          <Youtube />
        </a>
      </Button>
    </div>
  );
}
