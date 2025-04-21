
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { documentFormSchema, DocumentFormValues, DocumentFormProps } from "./types/form-types";
import { ClientSelect } from "./form/ClientSelect";
import { DocumentMetadataFields } from "./form/DocumentMetadataFields";
import { FormActions } from "./form/FormActions";

const DocumentUploadForm: React.FC<DocumentFormProps> = ({ 
  clients, 
  preSelectedClientId, 
  isSubmitting, 
  onCancel, 
  onSubmit 
}: DocumentFormProps) => {
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

  // Tornar o campo de título opcional para o upload em massa. Como a lógica de submissão irá atribuir o nome do arquivo se não estiver preenchido, isto é suficiente.
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            // Deixe o campo título vazio se o usuário não preencher (será processado na lógica do upload)
            const cleanData = { ...data, title: data.title?.trim() || "" };
            onSubmit(cleanData);
          })}
          className="space-y-4"
        >
          <ClientSelect 
            clients={clients} 
            disabled={!!preSelectedClientId}
          />

          <DocumentMetadataFields />          
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
