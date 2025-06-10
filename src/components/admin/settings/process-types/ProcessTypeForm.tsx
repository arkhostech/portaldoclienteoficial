import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProcessTypeFormProps {
  onAdd: (name: string) => void;
  isSubmitting: boolean;
}

export const ProcessTypeForm = ({ onAdd, isSubmitting }: ProcessTypeFormProps) => {
  const [newProcessType, setNewProcessType] = useState("");

  const handleAddProcess = () => {
    if (!newProcessType.trim()) {
      toast.error("Nome do processo não pode estar vazio");
      return;
    }

    onAdd(newProcessType.trim());
    setNewProcessType("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
      <div className="flex-1">
        <label 
          htmlFor="new-process" 
          className="text-sm font-medium leading-none mb-2 block"
          style={{ 
            color: '#14140F',
            fontWeight: 600 
          }}
        >
          Novo Tipo de Processo
        </label>
        <div className="flex gap-2">
          <Input
            id="new-process"
            value={newProcessType}
            onChange={(e) => setNewProcessType(e.target.value)}
            placeholder="Nome do processo"
            className="focus:border-[#053D38] max-w-md"
            style={{
              borderColor: '#e5e7eb',
            }}
          />
          <Button
            onClick={handleAddProcess}
            disabled={isSubmitting || !newProcessType.trim()}
            style={{
              backgroundColor: '#053D38',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 500,
              border: 'none',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && newProcessType.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#042d2a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && newProcessType.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#053D38';
              }
            }}
          >
            <Plus 
              className="h-4 w-4 mr-1" 
              style={{ color: 'white' }}
            />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};
