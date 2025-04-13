
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

interface PaymentsAccordionHeaderProps {
  toggleAllAccordions: () => void;
  expandedItems: string[];
  sortedClientIds: string[];
}

export function PaymentsAccordionHeader({ 
  toggleAllAccordions, 
  expandedItems, 
  sortedClientIds 
}: PaymentsAccordionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <CardTitle>Pagamentos Agendados</CardTitle>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleAllAccordions}
      >
        {expandedItems.length === sortedClientIds.length ? "Recolher todos" : "Expandir todos"}
      </Button>
    </div>
  );
}
