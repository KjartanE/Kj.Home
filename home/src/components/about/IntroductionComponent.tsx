import React from "react";
import EducationComponent from "./EducationComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resume } from "@/constants/resume";
import Image from "next/image";
import { Award } from "lucide-react";

const IntroductionComponent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-8">
          <Image
            src="/images/clancy.png"
            alt="Profile Image"
            width={120}
            height={120}
            className="aspect-square shrink-0 rounded-full border-4 border-border object-cover"
          />
          <div className="space-y-2">
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
