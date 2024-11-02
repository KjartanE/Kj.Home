"use client";

import { IEducation } from "../resume";
import { Card, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import React from "react";
import { Accordion, AccordionItem, Divider } from "@nextui-org/react";

export interface IEducationComponent {
  education: IEducation;
}

const EducationComponent: React.FC<IEducationComponent> = (props) => {
  const { education } = props;

  return (
    <Card className="bg-zinc-850 flex flex-row rounded-xl shadow-md">
      <Accordion variant="light">
        <AccordionItem
          key="1"
          aria-label="uvic logo"
          startContent={<Image alt="uvic logo" height={40} radius="sm" src="./uvic.jpg" width={40} />}
          title="Degree">
          <CardBody>
            <div className="flex flex-col">
              <p className="text-md font-bold">
                {education.school} | {education.graduation}
              </p>
              <p className="text-md">{education.degree}</p>
              <p className="text-small text-default-500">{education.major}</p>
            </div>
          </CardBody>
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="cert logo"
          startContent={<Image alt="cert logo" height={40} radius="sm" src="./aws.png" width={40} />}
          title="AWS">
          <CardBody>
            <div className="flex flex-col">
              <p className="text-md font-bold">AWS Certified Cloud Practitioner | June 2024 </p>
              <p className="text-small text-default-500">
                AWS Certified Cloud Practitioner is an entry-level certification that provides a foundational
                understanding of AWS cloud services.
              </p>
            </div>
          </CardBody>
        </AccordionItem>
        <AccordionItem
          key="3"
          aria-label="cert logo"
          startContent={<Image alt="cert logo" height={40} radius="sm" src="./openshift.png" width={40} />}
          title="OpenShift">
          <CardBody>
            <div className="flex flex-col">
              <div className="pb-4">
                <p className="text-md font-bold">B.C. Government, OpenShift 101 | June 2024</p>
                <p className="text-small text-default-500">
                  OpenShift 101 is a course that provides an introduction to OpenShift, a container orchestration
                  platform that allows for the deployment of containerized applications.
                </p>
              </div>
              <Divider />
              <div className="py-4">
                <p className="text-md font-bold">B.C. Government, OpenShift 201 | August 2024</p>
                <p className="text-small text-default-500">
                  OpenShift 201 is a course that provides an intermediate understanding of OpenShift, focusing on the
                  deployment and management of containerized applications.
                </p>
              </div>
            </div>
          </CardBody>
        </AccordionItem>
      </Accordion>
    </Card>
    // <Card className="mb-8">
    //   <CardHeader className="flex flex-row-reverse gap-3">
    //     <h1>Degree</h1>
    //   </CardHeader>
    //   <Divider />

    //   <Divider />
    // </Card>
  );
};

export default EducationComponent;
