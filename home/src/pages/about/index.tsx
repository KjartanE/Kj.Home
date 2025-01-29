"use client";

import MenuButton from "@/src/lib/components/nav/menu";
import * as React from "react";
import PersonalStickyComponent from "../../lib/components/about/PersonalStickyComponent";
import { resume } from "@/public/config/resume";
import IntroductionComponent from "../../lib/components/about/IntroductionComponent";
import QuartechComponent from "../../lib/components/about/QuartechComponent";
import ProjectsComponent from "../../lib/components/about/ProjectsComponent";
import SkillComponent from "../../lib/components/about/SkillComponent";


export default function AboutPage() {
  return (
    <div>
      <MenuButton>
        <PersonalStickyComponent personal={resume.personal} />
      </MenuButton>
      <div className="flex flex-col gap-4">
        <IntroductionComponent />
        <QuartechComponent />
        <ProjectsComponent />
        <SkillComponent />
      </div>
    </div>
  );
}
