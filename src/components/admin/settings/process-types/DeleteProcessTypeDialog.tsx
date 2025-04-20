
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProcessType {
  id: string;
  name: string;
}

interface DeleteProcessTypeDialogProps {
  open: boolean;
  processToDelete: ProcessType | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteProcessTypeDialog = ({
  open,
  processToDelete,
  onClose,
  onConfirm,
}: DeleteProcessTypeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o processo "{processToDelete?.name}"? 
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
