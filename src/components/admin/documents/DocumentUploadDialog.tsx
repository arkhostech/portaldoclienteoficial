
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentUploadForm, FormValues } from "./DocumentUploadForm";

interface Client {
  id: string;
  full_name: string;
  email: string;
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: FormValues) => Promise<boolean>;
  isSubmitting: boolean;
  clients: Client[];
}

export default function DocumentUploadDialog({
  open,
  onOpenChange,
  onUpload,
  isSubmitting,
  clients
}: DocumentUploadDialogProps) {
  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      onOpenChange(open);
    }
  };
  
  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>
        
        <DocumentUploadForm
          onSubmit={onUpload}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          clients={clients}
        />
      </DialogContent>
    </Dialog>
  );
}
