"use client";

import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { IContract, resume } from "@/public/config/resume";
import { Accordion, AccordionItem } from "@radix-ui/react-accordion";
import React from "react";

const QProjectsComponent: React.FC = () => {
  const q_work = resume.work_experience[0];

  const createTabs: React.FC = (items: IContract[]) => {
    return items.map((item) => {
      return (
        <TabsContent value={item.id} key={item.id} title={item.label}>
          <ContractData contract={item} />
        </TabsContent>
      );
    });
  }

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Dynamic tabs">
        {createTabs(q_work.contract)}
      </Tabs>
    </div>
  );
};

export default QProjectsComponent;

export interface IContractData {
  contract: IContract;
}

const ContractData: React.FC<IContractData> = ({ contract }) => {
  return (
    <div className="p-4">
      <CardHeader className="flex flex-col items-start">
        <h2 className="font-bold">{contract.title}</h2>
        <p>{contract.position}</p>
        <p className="text-gray-400">{contract.date}</p>
      </CardHeader>
      <CardContent>
        <p>{contract.description}</p>
        <Accordion type="single">
          <AccordionItem value="1" title="Details">
            <CardDescription className="flex flex-row justify-between">
              <ul className="list-inside list-disc space-y-1">
                {contract.notes &&
                  contract.notes.map((note, index) => (
                    <li key={index} className="text-gray-500">
                      {note}
                    </li>
                  ))}
              </ul>
            </CardDescription>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </div>
  );
};
