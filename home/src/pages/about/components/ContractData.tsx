import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { IContractData } from "@/src/lib/interfaces/about";

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
  
  export default ContractData;