import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface MultipleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export default function MultipleDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  onDelete,
  isDeleting
}: MultipleDeleteDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (!isDeleting) {
      onOpenChange(open);
    }
  };
  
  const handleDelete = async () => {
    await onDelete();
  };
  
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir múltiplos documentos</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente{" "}
            <span className="font-semibold">{selectedCount} documento{selectedCount !== 1 ? "s" : ""}</span>{" "}
            e todos os seus dados associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              `Excluir ${selectedCount} documento${selectedCount !== 1 ? "s" : ""}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 