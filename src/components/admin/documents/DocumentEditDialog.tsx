
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document } from "@/services/documents/types";
import { DocumentEditForm } from "./DocumentEditForm";

interface DocumentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onSave: (data: { title: string; description?: string }) => Promise<boolean>;
  isUpdating: boolean;
}

export default function DocumentEditDialog({
  open,
  onOpenChange,
  document,
  onSave,
  isUpdating
}: DocumentEditDialogProps) {
  // Handle dialog close safely, preventing closing during updates
  const handleOpenChange = (newOpen: boolean) => {
    if (!isUpdating) {
      onOpenChange(newOpen);
    }
  };
  
  const handleCancel = () => {
    if (!isUpdating) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>
        
        <DocumentEditForm
          document={document}
          onSubmit={onSave}
          onCancel={handleCancel}
          isUpdating={isUpdating}
        />
      </DialogContent>
    </Dialog>
  );
}
