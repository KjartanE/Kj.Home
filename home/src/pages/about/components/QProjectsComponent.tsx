"use client";
import { Tabs, Tab, CardBody, CardHeader, Divider, Accordion, AccordionItem } from "@nextui-org/react";
import { IContract, resume } from "../../../config/resume";
import { ChipList, sortChips } from "@/components/chip";

const QProjectsComponent: React.FC = () => {
  const q_work = resume.work_experience[0];

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Dynamic tabs" items={q_work.contract}>
        {(item) => (
          <Tab key={item.id} title={item.label}>
            <ContractData contract={item} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default QProjectsComponent;

export interface IContractData {
  contract: IContract;
}

const ContractData: React.FC<IContractData> = ({ contract }) => {
  const chipsDetails = sortChips(contract.technologies);

  const isMobile = window.innerWidth < 768;

  return (
    <div className="p-4">
      <CardHeader className="flex flex-col items-start">
        <h2 className="font-bold">{contract.title}</h2>
        <p>{contract.position}</p>
        <p className="text-gray-400">{contract.date}</p>
      </CardHeader>
      <CardBody>
        <p>{contract.description}</p>
        <Divider className="mt-4" />
        <Accordion variant="light">
          <AccordionItem key="1" title="Details">
            <CardBody className="flex flex-row justify-between">
              <ul className="list-inside list-disc space-y-1">
                {contract.notes &&
                  contract.notes.map((note, index) => (
                    <li key={index} className="text-gray-500">
                      {note}
                    </li>
                  ))}
              </ul>
                {!isMobile && (
                <div>
                  <ChipList chips={chipsDetails} />
                </div>
                )}
            </CardBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </div>
  );
};
