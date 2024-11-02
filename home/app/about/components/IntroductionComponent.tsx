import React from "react";
import { Card, Image } from "@nextui-org/react";
import QuartechComponent from "./QuartechComponent";
import ProjectsComponent from "./ProjectsComponent";
import EducationComponent from "./EducationComponent";
import { resume } from "../resume";

const IntroductionComponent: React.FC = () => {
  return (
    <Card className="space-y-4 rounded-xl bg-zinc-950 py-6 shadow-md">
      <Card className="flex flex-col justify-center py-8 px-4" fullWidth>
        <div className="flex flex-row items-center">
          <Image src="/clancy.png" alt="Profile Image" className="rounded-full" />
          <div className="grow flex-col justify-center p-8">
            <p className="p-2 text-2xl font-bold">Kjartan Robert Einarsson</p>
            <p className="p-2 text-gray-400">I am a Software Engineer with a passion for building things.</p>
          </div>
        </div>
          <EducationComponent education={resume.education[0]} />
      </Card>
      <QuartechComponent />
      <ProjectsComponent />
    </Card>
  );
};

export default IntroductionComponent;
