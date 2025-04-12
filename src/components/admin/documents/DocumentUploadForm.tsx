
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Client } from "@/services/clientService";

const documentFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  status: z.string().default("active")
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentUploadFormProps {
  clients: Client[];
  preSelectedClientId?: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: DocumentFormValues) => void;
}

const DocumentUploadForm = ({ 
  clients, 
  preSelectedClientId, 
  isSubmitting, 
  onCancel, 
  onSubmit 
}: DocumentUploadFormProps) => {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      client_id: preSelectedClientId || "",
      status: "active"
    }
  });

  // Ensure preSelectedClientId is used if provided
  React.useEffect(() => {
    if (preSelectedClientId && form.getValues("client_id") !== preSelectedClientId) {
      form.setValue("client_id", preSelectedClientId);
    }
  }, [preSelectedClientId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!!preSelectedClientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem 
                      key={client.id} 
                      value={client.id}
                    >
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título*</FormLabel>
              <FormControl>
                <Input placeholder="Título do documento" {...field} />
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
                <Input placeholder="Descrição (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enviar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DocumentUploadForm;
