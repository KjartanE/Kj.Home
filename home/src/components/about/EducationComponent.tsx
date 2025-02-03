"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IEducationComponent } from "@/types";
import React from "react";
import { GraduationCap } from "lucide-react";

const EducationComponent: React.FC<IEducationComponent> = (props) => {
  const { education } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {education.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-border/50 bg-background p-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold leading-none">{item.school}</h3>
                <p className="text-sm text-muted-foreground">{item.degree}</p>
                <p className="text-sm text-muted-foreground">
                  {item.major} | {item.graduation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EducationComponent;
