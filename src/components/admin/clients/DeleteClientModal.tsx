
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Client } from "@/services/clientService";
import { useEffect, useState } from "react";

interface DeleteClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<boolean>;
  isSubmitting: boolean;
}

const DeleteClientModal = ({
  client,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting
}: DeleteClientModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsDeleting(false);
    }
  }, [open]);
  
  const handleDelete = async () => {
    if (!client) return;
    
    try {
      setIsDeleting(true);
      const success = await onConfirm(client.id);
      
      if (success) {
        // Use a longer timeout to ensure all state updates have propagated
        setTimeout(() => {
          setIsDeleting(false);
          onOpenChange(false);
        }, 300);
      } else {
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    // Only allow closing if we're not in the middle of a deletion
    if (!open && !isSubmitting && !isDeleting) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
            {client && ` "${client.full_name}"`} e todos os seus documentos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleDialogClose(false)}
            disabled={isSubmitting || isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
          >
            {(isSubmitting || isDeleting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteClientModal;
