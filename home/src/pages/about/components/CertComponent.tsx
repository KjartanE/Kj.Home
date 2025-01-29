import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ICertification } from "@/public/config/resume";
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
          <CardContent>
            <CardTitle className="flex gap-3" key={certification.title}>
              <h1>{certification.title}</h1>
            </CardTitle>
            <CardDescription>
              <div className="flex flex-col">
                <p className="text-md">{certification.description}</p>
                <p className="text-small text-default-500">{certification.date}</p>
              </div>
            </CardDescription>
          </CardContent>
        );
      })}
    </Card>
  );
};

export default CertComponent;
