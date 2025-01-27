"use client";

import { resume } from "../../../public/config/resume.tsx";
import * as React from "react";

import SkillComponent from "./components/SkillComponent.tsx";
import IntroductionComponent from "./components/IntroductionComponent.tsx";
import PersonalStickyComponent from "./components/PersonalStickyComponent.tsx";
import QuartechComponent from "./components/QuartechComponent.tsx";
import ProjectsComponent from "./components/ProjectsComponent.tsx";
import MenuButton from "@/src/components/menu.tsx";

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
