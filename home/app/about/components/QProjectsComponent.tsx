"use client";
import { Tabs, Tab, Card, CardBody, CardHeader, Divider, Accordion, AccordionItem } from "@nextui-org/react";
import { IContract, resume } from "../../../config/resume";
import { ChipList, sortChips } from "@/components/chip";

const QProjectsComponent: React.FC = () => {
  const q_work = resume.work_experience[0];

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Dynamic tabs" items={q_work.contract}>
        {(item) => (
          <Tab key={item.id} title={item.label}>
            <Card>
              <CardBody>
                <ContractData contract={item} />
              </CardBody>
            </Card>
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

  return (
    <>
      <CardHeader />
      <h3 className="font-bold">{contract.title}</h3>
      <p>{contract.position}</p>
      <p className="text-gray-400">{contract.date}</p>
      <CardBody>
        <div className="p-2">
          <p>{contract.description}</p>
          <Divider className="my-2" />
        </div>
        <Accordion variant="light">
          <AccordionItem key="1" className="px-4" title="Details">
            <CardBody>
              <div className="flex">
                <ul className="list-inside list-disc space-y-1 px-4">
                  {contract.notes &&
                    contract.notes.map((note, index) => (
                      <li key={index} className="text-gray-500">
                        {note}
                      </li>
                    ))}
                </ul>
                <div>
                  <ChipList chips={chipsDetails} />
                </div>
              </div>
            </CardBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </>
  );
};
