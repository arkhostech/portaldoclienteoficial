import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { documentFormSchema, DocumentFormValues, DocumentFormProps } from "./types/form-types";
import { ClientSelect } from "./form/ClientSelect";
import { DocumentMetadataFields } from "./form/DocumentMetadataFields";
import { FormActions } from "./form/FormActions";
import { toast } from "sonner";
import { FileWithPreview } from "./types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

interface DocumentUploadFormExtendedProps extends DocumentFormProps {
  firstSelectedFileName?: string;
  files: FileWithPreview[];
}

const DocumentUploadForm: React.FC<DocumentUploadFormExtendedProps> = ({
  clients,
  preSelectedClientId,
  isSubmitting,
  onCancel,
  onSubmit,
  firstSelectedFileName,
  files
}) => {
  const isMultipleFiles = files.length > 1;

  const form = useForm<any>({
    defaultValues: {
      client_id: preSelectedClientId || "",
      description: "",
      status: "active" as const,
      title: isMultipleFiles ? undefined : (firstSelectedFileName?.replace(/\.[^/.]+$/, "") || ""),
      fileTitles: isMultipleFiles ? files.reduce((acc, file, index) => {
        acc[index] = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        return acc;
      }, {} as Record<number, string>) : undefined
    }
  });

  React.useEffect(() => {
    if (preSelectedClientId && form.getValues("client_id") !== preSelectedClientId) {
      form.setValue("client_id", preSelectedClientId);
    }
    
    // Update file titles when files change
    if (isMultipleFiles) {
      const currentTitles = form.getValues("fileTitles") || {};
      const newTitles = files.reduce((acc, file, index) => {
        acc[index] = currentTitles[index] || file.name.replace(/\.[^/.]+$/, "");
        return acc;
      }, {} as Record<number, string>);
      form.setValue("fileTitles", newTitles);
    } else if (firstSelectedFileName && !form.getValues("title")) {
      form.setValue("title", firstSelectedFileName.replace(/\.[^/.]+$/, ""));
    }
  }, [preSelectedClientId, firstSelectedFileName, form, files, isMultipleFiles]);

  const handleFormSubmit = (data: any) => {
    if (!data.client_id) {
      toast.error("Selecione um cliente");
      return;
    }
    
    // Validate multiple file titles
    if (isMultipleFiles) {
      const fileTitles = data.fileTitles || {};
      const hasEmptyTitles = files.some((_, index) => !fileTitles[index]?.trim());
      
      if (hasEmptyTitles) {
        toast.error("Todos os documentos devem ter um título");
        return;
      }
    }
    
    onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
          id="document-upload-form"
        >
          <ClientSelect
            clients={clients}
            disabled={!!preSelectedClientId}
          />
          
          {isMultipleFiles ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Nomes dos documentos ({files.length} arquivos)
                </h3>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <FormField
                      key={`${file.id}-${index}`}
                      control={form.control}
                      name={`fileTitles.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span className="font-normal text-muted-foreground">
                              {file.name}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nome do documento"
                              required
                              className="text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (aplicada a todos)</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <DocumentMetadataFields defaultTitle={firstSelectedFileName?.replace(/\.[^/.]+$/, "")} />
          )}
          
          <FormActions
            isSubmitting={isSubmitting}
            onCancel={onCancel}
          />
        </form>
      </Form>
    </FormProvider>
  );
};

export default DocumentUploadForm;
