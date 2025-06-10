import { useState } from "react";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { ProcessTypeForm } from "./process-types/ProcessTypeForm";
import { ProcessTypeTable } from "./process-types/ProcessTypeTable";
import { DeleteProcessTypeDialog } from "./process-types/DeleteProcessTypeDialog";
import { Card, CardContent } from "@/components/ui/card";

interface ProcessType {
  id: string;
  name: string;
}

const ProcessTypesTab = () => {
  const { processTypes, isLoading, isSubmitting, addProcessType, updateProcessType, deleteProcessType } = useProcessTypes();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<ProcessType | null>(null);

  const handleDelete = (process: ProcessType) => {
    setProcessToDelete(process);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!processToDelete) return;
    deleteProcessType(processToDelete.id);
    setDeleteConfirmOpen(false);
    setProcessToDelete(null);
  };

  const handleUpdateProcessType = (id: string, name: string) => {
    updateProcessType({ id, name });
  };

  return (
    <div className="space-y-6">
      {/* Card para Adicionar Novo Tipo */}
      <Card style={{ 
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent style={{ padding: '24px' }}>
          <h3 
            className="text-xl font-semibold mb-6" 
            style={{ color: '#14140F' }}
          >
            Adicionar Novo Tipo de Processo
          </h3>
          <ProcessTypeForm 
            onAdd={addProcessType}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      {/* Card para Lista de Tipos */}
      <Card style={{ 
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent style={{ padding: '24px' }}>
          <h3 
            className="text-xl font-semibold mb-6" 
            style={{ color: '#14140F' }}
          >
            Tipos de Processo Cadastrados
          </h3>
          <ProcessTypeTable
            processTypes={processTypes}
            onEdit={handleUpdateProcessType}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <DeleteProcessTypeDialog
        open={deleteConfirmOpen}
        processToDelete={processToDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ProcessTypesTab;
