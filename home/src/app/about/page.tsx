import type { Metadata } from "next";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";
import BioHeader, { BioActions } from "@/components/about/BioHeader";
import CareerTimeline from "@/components/about/CareerTimeline";
import SkillGroups from "@/components/about/SkillGroups";
import CreativeSection from "@/components/about/CreativeSection";
import EducationCerts from "@/components/about/EducationCerts";
import { resume } from "@/constants/resume";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kjartan Einarsson — Senior Full Stack Software Engineer in Victoria, BC. Career highlights, skills, and creative projects."
};

export default function AboutPage() {
  return (
    <div className="container mx-auto mt-14 max-w-3xl px-4 py-12">
      <PersistentPenroseBackground />

      <BioHeader personal={resume.personal} />
      <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">{resume.personal.description}</p>
      <div className="mt-6">
        <BioActions personal={resume.personal} />
      </div>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">Experience</h2>
        <CareerTimeline highlights={resume.highlights} />
      </section>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">Skills</h2>
        <SkillGroups groups={resume.skillGroups} />
      </section>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">Beyond work</h2>
        <CreativeSection projects={resume.creativeProjects} />
      </section>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">Education &amp; Certifications</h2>
        <EducationCerts education={resume.education} certifications={resume.certifications} awards={resume.awards} />
      </section>
    </div>
  );
}
