"use client";

import MenuButton from "@/src/lib/components/menu";
import * as React from "react";
import PersonalStickyComponent from "./components/PersonalStickyComponent";
import { resume } from "@/public/config/resume";
import IntroductionComponent from "./components/IntroductionComponent";
import QuartechComponent from "./components/QuartechComponent";
import ProjectsComponent from "./components/ProjectsComponent";
import SkillComponent from "./components/SkillComponent";


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
