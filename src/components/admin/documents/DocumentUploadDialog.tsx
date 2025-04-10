
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

type FormValues = z.infer<typeof formSchema>;

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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      client_id: ""
    }
  });
  
  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      form.reset();
      setSelectedFileName(null);
    }
    
    if (!isSubmitting) {
      onOpenChange(open);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    const success = await onUpload(data);
    
    if (success) {
      form.reset();
      setSelectedFileName(null);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Arquivo*</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <Input
                        type="file"
                        disabled={isSubmitting}
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        {...field}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("file-upload")?.click()}
                          disabled={isSubmitting}
                        >
                          Escolher arquivo
                        </Button>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {selectedFileName || "Nenhum arquivo selecionado"}
                        </span>
                      </div>
                    </div>
                  </FormControl>
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
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
