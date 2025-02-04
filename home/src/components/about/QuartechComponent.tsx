import React from "react";
import { positions } from "@/constants/positions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, ExternalLink, ChevronRight, GraduationCap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { resume } from "@/constants/resume";
import { getSkillsSection } from "./SkillsSection";

const QuartechComponent: React.FC = () => {
  const renderListSection = (title: string, items: string[]) => (
    <div className="space-y-2">
      <h4 className="text-lg font-semibold text-primary">{title}</h4>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, index) => (
          <li key={index} className="relative flex items-start gap-2">
            <ChevronRight className="absolute left-[-1rem] top-1 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSkillsSection = (title: string, items: string[]) => (
    <div className="space-y-2">
      <h4 className="text-lg font-semibold text-primary">{title}</h4>
      <div className="flex flex-wrap gap-3">{getSkillsSection(items)}</div>
    </div>
  );

  const contracts = resume.work_experience[0].contract;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-border/50 bg-background p-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Work Experience</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src="/images/quartech_logo.png"
                alt="Quartech Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h3 className="text-xl font-semibold">Full-stack Software Engineer</h3>
            </div>
            <p className="text-muted-foreground">
              Currently employed at Quartech Systems Ltd., working on various BC Government and internal company
              services.
            </p>
            <div>
              <Link
                href="https://quartech.com/"
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <span>quartech.com</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
              <p className="text-sm text-muted-foreground">Victoria, BC | 250-380-9686</p>
            </div>
          </div>

          <div className="space-y-6">
            <Tabs defaultValue={contracts[0].id}>
              <TabsList className="justify-start">
                {contracts.map((contract) => (
                  <TabsTrigger key={contract.id} value={contract.id}>
                    {contract.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {contracts.map((contract) => (
                <TabsContent key={contract.id} value={contract.id}>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{contract.title}</h3>
                    <p className="text-sm text-muted-foreground">{contract.position}</p>
                    <p className="text-sm text-muted-foreground">{contract.date}</p>
                    <p className="text-sm">{contract.description}</p>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-b-0">
                      <AccordionTrigger>Project Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {contract.notes && renderListSection("Responsibilities", contract.notes)}
                          {contract.technologies && renderSkillsSection("Technologies Used", contract.technologies)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg border border-border/50 bg-background p-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Position Requirements</h3>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {positions.map((position, index) => (
                <AccordionItem
                  key={index}
                  value={`position-${index}`}
                  className={index === positions.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {position.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-6 px-4">
                    {position.requirements.education && renderListSection("Education", position.requirements.education)}
                    {position.requirements.experience &&
                      renderListSection("Experience", position.requirements.experience)}
                    {position.requirements.technicalSkills &&
                      renderListSection("Technical Skills", position.requirements.technicalSkills)}
                    {position.requirements.softSkills &&
                      renderListSection("Soft Skills", position.requirements.softSkills)}
                    {position.requirements.responsibilities &&
                      renderListSection("Additional Responsibilities", position.requirements.responsibilities)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuartechComponent;
