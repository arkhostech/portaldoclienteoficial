
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";

interface DocumentsAccordionHeaderProps {
  toggleAllAccordions: () => void;
  expandedItems: string[];
  sortedClientIds: string[];
}

export function DocumentsAccordionHeader({ 
  toggleAllAccordions, 
  expandedItems, 
  sortedClientIds 
}: DocumentsAccordionHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <CardTitle>Gerenciar documentos</CardTitle>
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
