
import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, FileText } from "lucide-react";
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
import { Client } from "@/services/clientService";
import { cn } from "@/lib/utils";

const documentFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  status: z.string().default("active")
});

interface FileWithPreview extends File {
  preview?: string;
  id: string; // unique identifier for the file
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: { title?: string; description?: string; client_id: string; file: File }) => Promise<boolean>;
  isSubmitting: boolean;
  clients: Client[];
  preSelectedClientId?: string;
}

const DocumentUploadDialog = ({
  open,
  onOpenChange,
  onUpload,
  isSubmitting,
  clients,
  preSelectedClientId
}: DocumentUploadDialogProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      client_id: preSelectedClientId || "",
      status: "active"
    }
  });

  // Update default client_id when preSelectedClientId changes
  if (preSelectedClientId && form.getValues("client_id") !== preSelectedClientId) {
    form.setValue("client_id", preSelectedClientId);
  }
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        id: Math.random().toString(36).substring(2),
        preview: URL.createObjectURL(file)
      }))
    ]);
    
    // If no title is set yet and we're uploading a single file, use the file name
    if (!form.getValues("title") && acceptedFiles.length === 1) {
      const fileName = acceptedFiles[0].name.split('.')[0]; // Get name without extension
      form.setValue("title", fileName);
    }
  }, [form]);
  
  const removeFile = (id: string) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== id);
      
      // If no files are left, clear the title if it was set automatically
      if (updatedFiles.length === 0) {
        form.setValue("title", "");
      }
      
      return updatedFiles;
    });
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onDrop(filesArray);
    }
  };

  const handleSubmit = async (data: z.infer<typeof documentFormSchema>) => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload all files sequentially with a progress simulation
      let successCount = 0;
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData = { 
          ...data,
          // For multiple files, append a number to the title
          title: totalFiles > 1 ? `${data.title} (${i + 1})` : data.title,
          file 
        };
        
        // Simulate upload progress
        const intervalId = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 1, (i + 1) / totalFiles * 100 - 5));
        }, 50);
        
        const success = await onUpload(fileData);
        
        clearInterval(intervalId);
        
        if (success) {
          successCount++;
        }
        
        // Update progress based on completed uploads
        setUploadProgress((i + 1) / totalFiles * 100);
      }
      
      if (successCount > 0) {
        // Reset form and close dialog on successful upload
        setFiles([]);
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isUploading && !isSubmitting && open === false) {
      onOpenChange(open);
      // Clean up file previews and reset form when dialog is closed
      setFiles(prevFiles => {
        prevFiles.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
        return [];
      });
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer",
                files.length > 0 ? "border-primary/20 bg-primary/5" : "border-gray-300 hover:border-primary/30"
              )}
              onClick={handleBrowseFiles}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className={cn(
                "h-10 w-10 mb-2", 
                files.length > 0 ? "text-primary" : "text-gray-400"
              )} />
              <div className="text-center">
                <p className="font-medium">Clique para adicionar arquivos</p>
                <p className="text-sm text-muted-foreground">
                  ou arraste e solte aqui
                </p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Arquivos selecionados ({files.length})</p>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between bg-muted rounded-md p-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
                onClick={() => handleDialogClose(false)}
                disabled={isUploading || isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={files.length === 0 || isUploading || isSubmitting}
              >
                {(isUploading || isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUploading 
                  ? `Enviando (${Math.round(uploadProgress)}%)` 
                  : files.length > 1 
                    ? `Enviar ${files.length} Documentos` 
                    : "Enviar Documento"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
