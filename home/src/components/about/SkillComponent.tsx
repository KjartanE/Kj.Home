"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resume } from "@/constants/resume";
import { Layers } from "lucide-react";

const SkillComponent: React.FC = () => {
  const categories = {
    skills: {
      title: "Skills",
      items: resume.skills,
    },
    technologies: {
      title: "Technologies",
      items: resume.technologies,
    },
    languages: {
      title: "Languages",
      items: resume.languages,
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([key, category]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-2xl">{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {category.items.map((item) => (
                <Badge 
                  key={item} 
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <Layers className="h-4 w-4" />
                  <span>{item}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SkillComponent;
