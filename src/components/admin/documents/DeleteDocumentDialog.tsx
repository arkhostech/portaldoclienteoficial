
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Document } from "@/services/documents";

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
  // Use refs to track state between renders
  const isDeletingRef = useRef(isDeleting);
  const keepOpenRef = useRef(false);
  
  // Update refs when props change
  useEffect(() => {
    isDeletingRef.current = isDeleting;
  }, [isDeleting]);
  
  // Handle completion of delete operation
  useEffect(() => {
    if (!isDeleting && keepOpenRef.current) {
      // Reset flag and allow dialog to close after a short delay
      const timeout = setTimeout(() => {
        keepOpenRef.current = false;
        if (open) {
          onOpenChange(false);
        }
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isDeleting, open, onOpenChange]);

  const handleOpenChange = (isOpen: boolean) => {
    // Only allow state change if not in the middle of an operation
    if (!isDeletingRef.current && !keepOpenRef.current) {
      onOpenChange(isOpen);
    }
  };
  
  const handleConfirmDelete = () => {
    keepOpenRef.current = true;
    onConfirmDelete();
  };

  // Use AlertDialog for better accessibility and modal behavior
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento
            {document && ` "${document.title}"`}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault(); // Prevent default to handle manually
              handleConfirmDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDocumentDialog;
