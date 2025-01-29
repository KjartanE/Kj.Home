"use client";

import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { CardContent } from "@/components/ui/card";
import { IEducationComponent } from "@/src/lib/interfaces/about";
import React from "react";

const EducationComponent: React.FC<IEducationComponent> = (props) => {
  const { education } = props;

  return (
    <Accordion type="single" collapsible>
      {education.map((item, index) => (
        <AccordionItem key={index} className="px-4" aria-label="logo" value="logo" title={item.title}>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-md font-bold">{item.school}</p>
              <p className="text-md">{item.degree}</p>
              <p className="text-small text-default-500">
                {item.major} | {item.graduation}
              </p>
            </div>
          </CardContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EducationComponent;
