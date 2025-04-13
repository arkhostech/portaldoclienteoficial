
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client } from "@/services/clients/types";
import { Form } from "@/components/ui/form";

import { paymentSchema, PaymentFormValues } from "./form/types";
import { usePaymentFormHandler } from "./form/PaymentFormHandler";
import { 
  ClientSelectField, 
  TitleField, 
  AmountField, 
  DueDateField, 
  DescriptionField, 
  SubmitButton 
} from "./form/FormFields";

interface AdminPaymentFormProps {
  clients: Client[];
  onSuccess?: () => void;
  initialData?: PaymentFormValues & { id: string };
}

export function AdminPaymentForm({ clients, onSuccess, initialData }: AdminPaymentFormProps) {
  // Use our custom form handler hook
  const { isSubmitting, onSubmit } = usePaymentFormHandler({ onSuccess, initialData });

  // Initialize form with default values or edit values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      client_id: "",
      title: "",
      amount: "",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Client Select */}
        <ClientSelectField 
          control={form.control}
          clients={clients}
          disabled={isSubmitting}
        />

        {/* Payment Title */}
        <TitleField 
          control={form.control}
          disabled={isSubmitting}
        />

        {/* Amount */}
        <AmountField 
          control={form.control}
          disabled={isSubmitting}
        />

        {/* Due Date */}
        <DueDateField 
          control={form.control}
          disabled={isSubmitting}
        />

        {/* Description */}
        <DescriptionField 
          control={form.control}
          disabled={isSubmitting}
        />

        {/* Submit Button */}
        <SubmitButton 
          isSubmitting={isSubmitting}
          isEditMode={!!initialData?.id}
        />
      </form>
    </Form>
  );
}
