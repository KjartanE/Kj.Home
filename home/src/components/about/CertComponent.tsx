import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ICertification, ICertComponent } from "@/types";
import React from "react";

const CertComponent: React.FC<ICertComponent> = (props) => {
  const { certifications } = props;

  const cardContent = (data: ICertification[]) => {
    {
      return data.map((certification, key) => {
        return (
          <CardContent key={key}>
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
      });
    }
  };

  if (!certifications) return null;

  return <Card className="mb-8">{certifications && cardContent(certifications)}</Card>;
};

export default CertComponent;
