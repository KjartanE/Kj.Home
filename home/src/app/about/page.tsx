"use client";

import * as React from "react";
import PersonalStickyComponent from "@/components/about/PersonalStickyComponent";
import { resume } from "@/constants/resume";
import IntroductionComponent from "@/components/about/IntroductionComponent";
import QuartechComponent from "@/components/about/QuartechComponent";
import SkillsSection from "@/components/about/SkillsSection";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 mt-14">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="relative md:block">
          <div className="sticky top-20 backface-visibility-hidden transform-gpu will-change-transform">
            <PersonalStickyComponent personal={resume.personal} />
          </div>
        </div>
        <main className="space-y-6">
          <IntroductionComponent />
          <QuartechComponent />
          <SkillsSection />
        </main>
      </div>
    </div>
  );
}
