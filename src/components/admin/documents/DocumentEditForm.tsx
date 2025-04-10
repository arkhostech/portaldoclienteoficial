
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
import { DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentEditFormProps {
  document: Document | null;
  onSubmit: (data: { title: string; description?: string }) => Promise<boolean>;
  onCancel: () => void;
  isUpdating: boolean;
}

export function DocumentEditForm({
  document,
  onSubmit,
  onCancel,
  isUpdating
}: DocumentEditFormProps) {
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
  
  const handleSubmit = async (data: FormValues) => {
    try {
      const success = await onSubmit({
        title: data.title,
        description: data.description
      });
      
      if (success) {
        // Let the document update complete before interacting with state
        setTimeout(() => {
          if (!isUpdating) {
            onCancel();
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            onClick={onCancel}
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
  );
}
