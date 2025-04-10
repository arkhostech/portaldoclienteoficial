
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { FileUploadField } from "./FileUploadField";

interface Client {
  id: string;
  full_name: string;
  email: string;
}

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  file: z.instanceof(File, { message: "Arquivo é obrigatório" })
});

export type FormValues = z.infer<typeof formSchema>;

interface DocumentUploadFormProps {
  onSubmit: (data: FormValues) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
  clients: Client[];
}

export function DocumentUploadForm({
  onSubmit,
  onCancel,
  isSubmitting,
  clients
}: DocumentUploadFormProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      client_id: ""
    }
  });
  
  const handleFormSubmit = async (data: FormValues) => {
    const success = await onSubmit(data);
    
    if (success) {
      form.reset();
      setSelectedFileName(null);
    }
  };
  
  const handleFileChange = (file: File | null) => {
    if (file) {
      form.setValue("file", file);
      setSelectedFileName(file.name);
      
      // Auto-fill title with file name if title is empty
      if (!form.getValues("title")) {
        form.setValue("title", file.name.split('.')[0]);
      }
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente*</FormLabel>
              <Select 
                disabled={isSubmitting}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.length > 0 ? (
                    clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_clients_available" disabled>
                      Nenhum cliente disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FileUploadField 
          onChange={handleFileChange}
          isSubmitting={isSubmitting}
          selectedFileName={selectedFileName}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do documento" 
                  disabled={isSubmitting} 
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
                  disabled={isSubmitting} 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
