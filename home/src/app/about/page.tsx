"use client";

import * as React from "react";
import PersonalStickyComponent from "@/components/about/PersonalStickyComponent";
import { resume } from "@/constants/resume";
import IntroductionComponent from "@/components/about/IntroductionComponent";
import QuartechComponent from "@/components/about/QuartechComponent";
import SkillsSection from "@/components/about/SkillsSection";

export default function AboutPage() {
  return (
    <div className="container mx-auto mt-14 py-8">
      {/*
        Show for desktop and tablet
      */}
      <div className="hidden gap-6 md:grid md:grid-cols-[300px_1fr]">
        <div className="relative md:block">
          <div className="backface-visibility-hidden sticky top-20 transform-gpu will-change-transform">
            <PersonalStickyComponent personal={resume.personal} />
          </div>
        </div>
        <main className="space-y-6">
          <IntroductionComponent />
          <QuartechComponent />
          <SkillsSection />
        </main>
      </div>

      {/*
        Show for mobile
      */}
      <div className="space-y-4 px-4 md:hidden">
        <IntroductionComponent />
        <QuartechComponent />
        <SkillsSection />
        <PersonalStickyComponent personal={resume.personal} />
      </div>
    </div>
  );
}
