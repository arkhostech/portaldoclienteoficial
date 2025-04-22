
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { documentFormSchema, DocumentFormValues, DocumentFormProps } from "./types/form-types";
import { ClientSelect } from "./form/ClientSelect";
import { DocumentMetadataFields } from "./form/DocumentMetadataFields";
import { FormActions } from "./form/FormActions";
import { toast } from "sonner";

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

  React.useEffect(() => {
    if (preSelectedClientId && form.getValues("client_id") !== preSelectedClientId) {
      form.setValue("client_id", preSelectedClientId);
    }
  }, [preSelectedClientId, form]);

  // Function to handle form submission
  const handleFormSubmit = (data: DocumentFormValues) => {
    console.log("Form submitted with data:", data);
    
    if (!data.client_id) {
      toast.error("Selecione um cliente");
      return;
    }
    
    // Make sure we're passing the complete data to the onSubmit callback
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
