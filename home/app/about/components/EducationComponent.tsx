import { IEducation } from "../resume";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";
import React from "react";

export interface IEducationComponent {
  education: IEducation;
}

const EducationComponent: React.FC<IEducationComponent> = (props) => {
  const { education } = props;

  return (
    <Card className="mb-8">
      <CardHeader className="flex gap-3">
        <Image alt="uvic logo" height={40} radius="sm" src="./uvic.jpg" width={40} />
        <h1>Education</h1>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="flex flex-col">
          <p className="text-md">{education.school}</p>
          <p className="text-md">{education.major}</p>
          <p className="text-md">{education.degree}</p>
          <p className="text-small text-default-500">{education.graduation}</p>
        </div>
      </CardBody>
      <Divider />
    </Card>
  );
};

export default EducationComponent;
