
import { useState } from "react";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { ProcessTypeForm } from "./process-types/ProcessTypeForm";
import { ProcessTypeTable } from "./process-types/ProcessTypeTable";
import { DeleteProcessTypeDialog } from "./process-types/DeleteProcessTypeDialog";

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
      <ProcessTypeForm 
        onAdd={addProcessType}
        isSubmitting={isSubmitting}
      />

      <ProcessTypeTable
        processTypes={processTypes}
        onEdit={handleUpdateProcessType}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />

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
