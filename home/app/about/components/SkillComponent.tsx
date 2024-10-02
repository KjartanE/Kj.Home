import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import React from "react";

export interface ISkillComponent {
  title: string;
  skills: string[];
}

const SkillComponent: React.FC<ISkillComponent> = (props) => {
  const { title, skills } = props;

  return (
    <Card className="mb-8">
      <CardHeader className="flex gap-3">
        <h1>{title}</h1>
      </CardHeader>
      <Divider />
      <CardBody>
        <ul>
          {skills.map((skill, index) => {
            return (
              <li key={`${title}-${index}`} className="ml-4 list-disc">
                {skill}
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
};

export default SkillComponent;
