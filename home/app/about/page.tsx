"use client";

import { resume } from "./resume.tsx";
import * as React from "react";

import SkillComponent from "./components/SkillComponent.tsx";
import IntroductionComponent from "./components/IntroductionComponent.tsx";
import PersonalStickyComponent from "./components/PersonalStickyComponent.tsx";
import QuartechComponent from "./components/QuartechComponent.tsx";
import ProjectsComponent from "./components/ProjectsComponent.tsx";

function MenuButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative z-40">
      <button className="fixed bottom-0 left-0 mb-4 ml-4 rounded-r bg-gray-900 p-1 text-white" onClick={toggleMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
        </svg>
      </button>
      {isOpen && (
        <div className="fixed bottom-0 left-0 z-40 p-4 shadow-lg transform transition-transform duration-300 ease-in-out" style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}>
          <PersonalStickyComponent personal={resume.personal} onClick={toggleMenu} />
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div>
      <MenuButton />
      <div className="flex flex-col gap-4">
      <IntroductionComponent />
      <QuartechComponent />
      <ProjectsComponent />
      <SkillComponent />
      </div>
    </div>
  );
}
