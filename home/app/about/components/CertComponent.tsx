import { ICertification } from "../resume";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import React from "react";

export interface ICertComponent {
  certifications: ICertification[];
}

const CertComponent: React.FC<ICertComponent> = (props) => {
  const { certifications } = props;

  return (
    <Card className="mb-8">
      {certifications.map((certification) => {
        return (
          <>
            <CardHeader className="flex gap-3" key={certification.title}>
              
              <h1>{certification.title}</h1>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col">
                <p className="text-md">{certification.description}</p>
                <p className="text-small text-default-500">{certification.date}</p>
              </div>
            </CardBody>
            <Divider />
          </>
        );
      })}
    </Card>
  );
};

export default CertComponent;
