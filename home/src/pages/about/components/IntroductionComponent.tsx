import React from "react";
import EducationComponent from "./EducationComponent";
import { Card } from "@/components/ui/card";
import { resume } from "@/public/config/resume";
import Image from "next/image";

const IntroductionComponent: React.FC = () => {
  return (
    <Card className="flex flex-col justify-center">
      <div className="flex flex-row items-center p-4 space-x-4">
        <Image src="/clancy.png" alt="Profile Image" className="rounded-full" />
        <div className="grow flex-col justify-center">
          <p className="p-2 text-2xl font-bold">Kjartan Robert Einarsson</p>
          <p className="p-2 text-gray-400">I am a Software Engineer with a passion for building things.</p>
        </div>
      </div>
      <EducationComponent education={resume.education} />
    </Card>
  );
};

export default IntroductionComponent;
