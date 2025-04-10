
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document } from "@/services/documentService";

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  document: Document | null;
}

const DeleteDocumentDialog = ({
  open,
  onOpenChange,
  isDeleting,
  onConfirmDelete,
  document
}: DeleteDocumentDialogProps) => {
  const handleDeleteDialogChange = (open: boolean) => {
    if (!isDeleting) {
      onOpenChange(open);
    } else if (open) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDeleteDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento
            {document && ` "${document.title}"`}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              if (!isDeleting) {
                onOpenChange(false);
              }
            }}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocumentDialog;
