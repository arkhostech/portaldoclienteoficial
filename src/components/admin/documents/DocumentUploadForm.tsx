
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { documentFormSchema, DocumentFormValues, DocumentFormProps } from "./types/form-types";
import { ClientSelect } from "./form/ClientSelect";
import { DocumentMetadataFields } from "./form/DocumentMetadataFields";
import { FormActions } from "./form/FormActions";
import { toast } from "sonner";

interface DocumentUploadFormExtendedProps extends DocumentFormProps {
  firstSelectedFileName?: string;
}

const DocumentUploadForm: React.FC<DocumentUploadFormExtendedProps> = ({
  clients,
  preSelectedClientId,
  isSubmitting,
  onCancel,
  onSubmit,
  firstSelectedFileName
}) => {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: firstSelectedFileName || "",
      description: "",
      client_id: preSelectedClientId || "",
      status: "active"
    }
  });

  React.useEffect(() => {
    if (preSelectedClientId && form.getValues("client_id") !== preSelectedClientId) {
      form.setValue("client_id", preSelectedClientId);
    }
    // Prefill "title" with first file name if not set already (covers edge case)
    if (firstSelectedFileName && !form.getValues("title")) {
      form.setValue("title", firstSelectedFileName);
    }
  }, [preSelectedClientId, firstSelectedFileName, form]);

  const handleFormSubmit = (data: DocumentFormValues) => {
    if (!data.client_id) {
      toast.error("Selecione um cliente");
      return;
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
          <DocumentMetadataFields defaultTitle={firstSelectedFileName} />
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
