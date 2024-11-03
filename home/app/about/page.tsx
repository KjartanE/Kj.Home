import { resume } from "./resume.tsx";
import * as React from "react";

import SkillComponent from "./components/SkillComponent.tsx";
import IntroductionComponent from "./components/IntroductionComponent.tsx";
import PersonalStickyComponent from "./components/PersonalStickyComponent.tsx";
import QuartechComponent from "./components/QuartechComponent.tsx";
import ProjectsComponent from "./components/ProjectsComponent.tsx";

export default function AboutPage() {
  return (
    <div className="flex">
      <PersonalStickyComponent personal={resume.personal} />
      <div className="flex flex-col gap-4 px-8">
        <IntroductionComponent />
        <QuartechComponent />
        <ProjectsComponent />
        <SkillComponent />
      </div>
    </div>
  );
}
