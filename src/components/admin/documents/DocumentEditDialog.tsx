
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Document } from "@/services/documents/types";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onSave: (data: { title: string; description?: string }) => Promise<boolean>;
  isUpdating: boolean;
}

export default function DocumentEditDialog({
  open,
  onOpenChange,
  document,
  onSave,
  isUpdating
}: DocumentEditDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: document?.title || "",
      description: document?.description || ""
    }
  });
  
  // Update form values when document changes
  useEffect(() => {
    if (document) {
      form.reset({
        title: document.title,
        description: document.description || ""
      });
    }
  }, [document, form]);
  
  const onSubmit = async (data: FormValues) => {
    // Ensure title is always passed as a string (TypeScript safety)
    await onSave({
      title: data.title,
      description: data.description
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isUpdating) {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do documento" 
                      disabled={isUpdating} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do documento (opcional)" 
                      disabled={isUpdating} 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
