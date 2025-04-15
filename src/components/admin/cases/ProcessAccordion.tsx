
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Client } from "@/services/clients/types";
import ProcessList from "./ProcessList";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProcessAccordionProps {
  groups: { type: string; clients: Client[] }[];
  isLoading: boolean;
}

const ProcessAccordion = ({ groups, isLoading }: ProcessAccordionProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhum processo encontrado</p>
      </Card>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-4">
      {groups.map(({ type, clients }) => (
        <AccordionItem key={type} value={type} className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-4">
              <span className="font-semibold">{type}</span>
              <span className="text-sm text-muted-foreground">
                ({clients.length} {clients.length === 1 ? "processo" : "processos"})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ProcessList clients={clients} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ProcessAccordion;
