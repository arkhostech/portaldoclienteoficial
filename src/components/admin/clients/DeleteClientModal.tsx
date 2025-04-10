
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
  
  const handleDelete = async () => {
    if (client) {
      const success = await onConfirm(client.id);
      if (success) {
        handleDialogClose(false);
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
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
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting && (
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
