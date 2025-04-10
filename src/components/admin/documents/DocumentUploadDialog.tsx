
import React, { useRef, useEffect } from "react";
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

// Form validation schema for uploading documents
const documentFormSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  status: z.string().default("active"),
  file: z.instanceof(File, { message: "Arquivo é obrigatório" })
});

export type DocumentUploadFormData = z.infer<typeof documentFormSchema>;

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (data: DocumentUploadFormData) => void;
}

const DocumentUploadDialog = ({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit
}: DocumentUploadDialogProps) => {
  // Track if we're in the process of submitting
  const isSubmittingRef = useRef(isSubmitting);
  // Track if the dialog should be forcibly kept open
  const keepOpenRef = useRef(false);
  
  const uploadForm = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active"
    }
  });

  // Update ref when prop changes
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      uploadForm.reset({
        title: "",
        description: "",
        status: "active"
      });
      
      // Reset refs
      keepOpenRef.current = false;
    }
  }, [open, uploadForm]);

  // Handle completion of submission
  useEffect(() => {
    if (!isSubmitting && keepOpenRef.current) {
      // Reset flag and close dialog after a short delay
      const timeout = setTimeout(() => {
        keepOpenRef.current = false;
        if (open) {
          onOpenChange(false);
        }
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isSubmitting, open, onOpenChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadForm.setValue('file', e.target.files[0]);
    }
  };

  const handleFormSubmit = (data: DocumentUploadFormData) => {
    keepOpenRef.current = true;
    onSubmit(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    // Only allow dialog to close if not submitting and not "kept open"
    if (!isSubmittingRef.current && !keepOpenRef.current) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside during submission
          if (isSubmittingRef.current || keepOpenRef.current) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with escape key during submission
          if (isSubmittingRef.current || keepOpenRef.current) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Enviar Novo Documento</DialogTitle>
          <DialogDescription>
            Preencha os dados e anexe o arquivo para enviar
          </DialogDescription>
        </DialogHeader>
        <Form {...uploadForm}>
          <form onSubmit={uploadForm.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={uploadForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Título do documento" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={uploadForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descrição do documento" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={uploadForm.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arquivo*</FormLabel>
                  <FormControl>
                    <div className="grid w-full max-w-md items-center gap-1.5">
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange} 
                        disabled={isSubmitting}
                      />
                    </div>
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
                  if (!isSubmitting && !keepOpenRef.current) {
                    onOpenChange(false);
                  }
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
