
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Document } from "@/services/documents/types";

interface DocumentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onDelete: () => Promise<boolean>;
  isDeleting: boolean;
}

export default function DocumentDeleteDialog({
  open,
  onOpenChange,
  document,
  onDelete,
  isDeleting
}: DocumentDeleteDialogProps) {
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
          <AlertDialogTitle>Excluir documento</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento <span className="font-semibold">"{document?.title}"</span> e todos os seus dados associados.
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
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
