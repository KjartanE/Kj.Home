import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resume } from "@/constants/resume";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Wrench,
  Lightbulb,
  Layers,
  Leaf,
  Component,
  Database,
  DatabaseZap,
  SquareKanban,
  Plug,
  Cable,
  MessageSquare,
  Network,
  HardDrive,
  Users
} from "lucide-react";
import Image from "next/image";

const SkillsSection: React.FC = () => {
  const iconStyle = "w-5 h-5 object-contain";

  const getIconForTech = (tech: string) => {
    const iconPath = (name: string) => `/svg/${name.toLowerCase()}.svg`;

    switch (tech) {
      case "JavaScript/TypeScript":
        return (
          <Image src={iconPath("language/javascript")} alt="JavaScript" width={20} height={20} className={iconStyle} />
        );
      case "Python":
        return <Image src={iconPath("language/python")} alt="Python" width={20} height={20} className={iconStyle} />;
      case "Java":
        return <Image src={iconPath("language/java")} alt="Java" width={20} height={20} className={iconStyle} />;
      case "C/C++":
        return <Image src={iconPath("language/c")} alt="C" width={20} height={20} className={iconStyle} />;
      case "HTML":
        return <Image src={iconPath("language/html")} alt="HTML" width={20} height={20} className={iconStyle} />;
      case "CSS":
        return <Image src={iconPath("language/css")} alt="CSS" width={20} height={20} className={iconStyle} />;
      case "Docker":
        return <Image src={iconPath("info/docker")} alt="Docker" width={20} height={20} className={iconStyle} />;
      case "OpenShift":
        return (
          <Image src={iconPath("deployment/openshift")} alt="OpenShift" width={20} height={20} className={iconStyle} />
        );
      case "GitHub/Git":
        return <Image src={iconPath("software/git")} alt="Git" width={20} height={20} className={iconStyle} />;
      case "React":
        return <Image src={iconPath("library/react")} alt="React" width={20} height={20} className={iconStyle} />;
      case "Node.js":
      case "NodeJS":
        return <Image src={iconPath("library/node")} alt="Node.js" width={20} height={20} className={iconStyle} />;
      case "MongoDB":
        return <Image src={iconPath("database/mongodb")} alt="MongoDB" width={20} height={20} className={iconStyle} />;
      case "PostgreSQL":
        return (
          <Image src={iconPath("database/postgres")} alt="PostgreSQL" width={20} height={20} className={iconStyle} />
        );
      case "MySQL":
        return <Image src={iconPath("database/my_sql")} alt="MySQL" width={20} height={20} className={iconStyle} />;
      case "Vue.js":
      case "Vue.JS":
        return <Image src={iconPath("framework/vue")} alt="Vue.js" width={20} height={20} className={iconStyle} />;
      case "Next.js":
        return <Image src={iconPath("framework/next")} alt="Next.js" width={20} height={20} className={iconStyle} />;
      case "Material-UI":
        return (
          <Image
            src={iconPath("framework/material-ui")}
            alt="Material-UI"
            width={20}
            height={20}
            className={iconStyle}
          />
        );

      case "AWS":
        return <Image src={iconPath("deployment/aws")} alt="AWS" width={20} height={20} className={iconStyle} />;
      case "Azure":
        return <Image src={iconPath("deployment/azure")} alt="Azure" width={20} height={20} className={iconStyle} />;
      case "Bash":
        return <Image src={iconPath("language/bash")} alt="Bash" width={20} height={20} className={iconStyle} />;
      case "Jest/Mocha/Selenium":
        return <Image src={iconPath("framework/jest")} alt="Mocha" width={20} height={20} className={iconStyle} />;
      case "Linux":
        return <Image src={iconPath("hardware/linux")} alt="Linux" width={20} height={20} className={iconStyle} />;
      case "GitHub Actions":
        return (
          <Image src={iconPath("info/github")} alt="GitHub Actions" width={20} height={20} className={iconStyle} />
        );
      case "GIS Leaflet":
        return <Leaf className={iconStyle} />;
      case "Cypress":
        return <Image src={iconPath("software/cypress")} alt="Cypress" width={20} height={20} className={iconStyle} />;
      case "Web Design":
        return <Component className={iconStyle} />;
      case "Data Structures":
        return <Database className={iconStyle} />;
      case "Database Management":
        return <DatabaseZap className={iconStyle} />;
      case "Agile Development":
        return <SquareKanban className={iconStyle} />;
      case "Soldering and Wiring Hardware":
        return <Cable className={iconStyle} />;
      case "Communication":
        return <MessageSquare className={iconStyle} />;
      case "Network Management":
        return <Network className={iconStyle} />;
      case "Raspberry Pi Development":
        return <HardDrive className={iconStyle} />;
      case "Teamwork":
        return <Users className={iconStyle} />;
      default:
        return <Layers className={iconStyle} />;
    }
  };

  const categories = {
    languages: {
      title: "Programming Languages",
      items: resume.languages,
      icon: <Code className="h-5 w-5 text-muted-foreground" />
    },
    technologies: {
      title: "Technologies & Tools",
      items: resume.technologies,
      icon: <Wrench className="h-5 w-5 text-muted-foreground" />
    },
    skills: {
      title: "Skills",
      items: resume.skills,
      icon: <Lightbulb className="h-5 w-5 text-muted-foreground" />
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([key, category]) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="rounded-lg border border-border/50 bg-background p-2">{category.icon}</div>
              <CardTitle className="text-2xl">{category.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {category.items.map((item) => (
                <Badge key={item} variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
                  {getIconForTech(item)}
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

export default SkillsSection;
