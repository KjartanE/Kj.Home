import React from "react";
import EducationComponent from "./EducationComponent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { resume } from "@/constants/resume";
import Image from "next/image";

const IntroductionComponent: React.FC = () => {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
          <div className="shrink-0">
            <Image
              src="/images/clancy.png"
              alt="Profile Image"
              width={120}
              height={120}
              className="aspect-square rounded-full border-4 border-border object-cover"
            />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Kjartan Robert Einarsson</h2>
            <p className="text-lg text-muted-foreground">Software Engineer with a passion for building things</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <EducationComponent education={resume.education} />
      </CardContent>
    </Card>
  );
};

export default IntroductionComponent;
