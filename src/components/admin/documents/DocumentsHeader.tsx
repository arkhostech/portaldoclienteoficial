
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DocumentsHeaderProps {
  onAddDocument: () => void;
}

export function DocumentsHeader({ onAddDocument }: DocumentsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Documentos</h1>
      <Button onClick={onAddDocument}>
        <Plus className="mr-2 h-4 w-4" /> Adicionar documento
      </Button>
    </div>
  );
}
