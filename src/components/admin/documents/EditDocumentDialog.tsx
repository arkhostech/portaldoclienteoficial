import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Document } from "@/services/documents";

// Form validation schema for editing document metadata
const documentMetadataFormSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
});

export type DocumentMetadataFormData = z.infer<typeof documentMetadataFormSchema>;

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUpdating: boolean;
  onSubmit: (data: DocumentMetadataFormData) => void;
  document: Document | null;
}

const EditDocumentDialog = ({
  open,
  onOpenChange,
  isUpdating,
  onSubmit,
  document
}: EditDocumentDialogProps) => {
  // Track if we're in the process of submitting
  const isSubmittingRef = useRef(false);
  // Track if the dialog should be forcibly kept open
  const keepOpenRef = useRef(false);
  
  const editForm = useForm<DocumentMetadataFormData>({
    resolver: zodResolver(documentMetadataFormSchema),
    defaultValues: {
      title: document?.title || "",
      description: document?.description || "",
    }
  });

  // Reset form and refs when document changes or dialog opens/closes
  useEffect(() => {
    if (document && open) {
      editForm.reset({
        title: document.title,
        description: document.description || "",
      });
      
      // Reset refs when dialog opens
      isSubmittingRef.current = false;
      keepOpenRef.current = false;
    }
  }, [document, open, editForm]);

  // Reset submitting state when isUpdating changes to false (update completed)
  useEffect(() => {
    if (!isUpdating && isSubmittingRef.current) {
      isSubmittingRef.current = false;
      
      // Allow a short delay before permitting dialog to close
      setTimeout(() => {
        keepOpenRef.current = false;
        
        // If the update completed successfully, close the dialog
        if (open) {
          onOpenChange(false);
        }
      }, 300);
    }
  }, [isUpdating, open, onOpenChange]);

  const handleSubmit = (data: DocumentMetadataFormData) => {
    isSubmittingRef.current = true;
    keepOpenRef.current = true;
    onSubmit(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    // Only allow close if we're not updating and not in "keep open" state
    if (!isUpdating && !keepOpenRef.current) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]" 
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside during update or when keeping open
          if (isUpdating || keepOpenRef.current) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with escape key during update or when keeping open
          if (isUpdating || keepOpenRef.current) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
          <DialogDescription>
            Atualize as informações do documento
          </DialogDescription>
        </DialogHeader>
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Título do documento" disabled={isUpdating} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descrição do documento" disabled={isUpdating} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (!isUpdating && !keepOpenRef.current) {
                    onOpenChange(false);
                  }
                }}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Atualizar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
