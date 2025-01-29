"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { IContract, resume } from "@/public/config/resume";
import React from "react";
import ContractData from "./ContractData";

const QProjectsComponent: React.FC = () => {
  const q_work = resume.work_experience[0];

  const createTabs = (items: IContract[]) => {
    return items.map((item) => {
      return (
        <TabsContent value={item.id} key={item.id} title={item.label}>
          <ContractData contract={item} />
        </TabsContent>
      );
    });
  };

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Dynamic tabs">{createTabs(q_work.contract)}</Tabs>
    </div>
  );
};

export default QProjectsComponent;
