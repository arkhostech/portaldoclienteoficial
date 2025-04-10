
import React from "react";
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
import { Document } from "@/services/documentService";

// Form validation schema for editing document metadata
const documentMetadataFormSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  status: z.string().default("active")
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
  const editForm = useForm<DocumentMetadataFormData>({
    resolver: zodResolver(documentMetadataFormSchema),
    defaultValues: {
      title: document?.title || "",
      description: document?.description || "",
      status: document?.status || "active"
    }
  });

  // Update form when document changes
  React.useEffect(() => {
    if (document) {
      editForm.reset({
        title: document.title,
        description: document.description || "",
        status: document.status
      });
    }
  }, [document, editForm]);

  // Using a ref to track if we're submitting to prevent dialog from closing prematurely
  const submittingRef = React.useRef(false);

  const handleSubmit = (data: DocumentMetadataFormData) => {
    submittingRef.current = true;
    onSubmit(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    // Only allow close if we're not in the process of updating
    if (!isUpdating && !submittingRef.current) {
      onOpenChange(isOpen);
    }
  };

  // Reset submitting state when isUpdating changes to false (update completed)
  React.useEffect(() => {
    if (!isUpdating) {
      submittingRef.current = false;
    }
  }, [isUpdating]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => {
        // Prevent closing when clicking outside during update
        if (isUpdating || submittingRef.current) {
          e.preventDefault();
        }
      }}>
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
            <FormField
              control={editForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                      {...field}
                      disabled={isUpdating}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
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
                  if (!isUpdating && !submittingRef.current) {
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
