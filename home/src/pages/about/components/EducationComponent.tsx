"use client";

import { IEducation } from "../../../../public/config/resume";
import { CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";

export interface IEducationComponent {
  education: IEducation[];
}

const EducationComponent: React.FC<IEducationComponent> = (props) => {
  const { education } = props;

  return (
    <Accordion variant="light">
      {education.map((item, index) => (
        <AccordionItem
          key={index}
          className="px-4"
          aria-label="logo"
          startContent={<Image alt="logo" height={40} radius="sm" src={item.logo} width={40} />}
          title={item.title}>
          <CardBody>
            <div className="flex flex-col">
              <p className="text-md font-bold">{item.school}</p>
              <p className="text-md">{item.degree}</p>
              <p className="text-small text-default-500">
                {item.major} | {item.graduation}
              </p>
            </div>
          </CardBody>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EducationComponent;
