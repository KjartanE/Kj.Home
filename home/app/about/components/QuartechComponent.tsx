import React from "react";
import { Card, Image } from "@nextui-org/react";
import QProjectsComponent from "./QProjectsComponent";

const QuartechComponent: React.FC = () => {
  return (
    <Card className="space-y-4 rounded-xl p-6 shadow-md">
      <div className="flex">
        <div className="ml-4 flex flex-col justify-center">
          <span className="px-4 py-1">
            I am currently working as a Software Engineer at <strong>Quartech ltd</strong>, as a full-stack developer.
          </span>
          <span className="px-4 py-1">
            I have been working on a variety of projects for BC Government and internal company services.
          </span>
        </div>
        <div className="ml-4 flex flex-col justify-center">
          <Image src="/quartech_logo.png" alt="Quartech Image" width={200} height={200} />
          <div className="flex flex-col justify-center py-6">
            <a href="https://quartech.com/">
              <h1 className="font-bold">Quartech</h1>
            </a>
            <p>Victoria, BC | 250-380-9686</p>
            <p className="text-gray-400">
              People-centric IT solutions that empower organizations to better serve their communities.
            </p>
          </div>
        </div>
      </div>
      <QProjectsComponent />
    </Card>
  );
};

export default QuartechComponent;
