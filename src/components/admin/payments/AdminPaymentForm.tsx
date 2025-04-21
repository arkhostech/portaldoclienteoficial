
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client } from "@/services/clients/types";
import { Form } from "@/components/ui/form";

import { paymentSchema, PaymentFormValues } from "./form/types";
import { usePaymentFormHandler } from "./form/PaymentFormHandler";
import { 
  ClientSelectField, 
  TitleField, 
  DescriptionField, 
  SubmitButton 
} from "./form/FormFields";
import { EntryPaymentFields } from "./form/EntryPaymentFields";
import { InstallmentFields } from "./form/InstallmentFields";

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
      due_date: new Date(),
      description: "",
      is_paid: true,
      enable_installments: false,
      installments_count: 0,
      installment_frequency: "monthly",
      installment_amount: "",
      first_installment_date: new Date(),
    },
  });

  // Watch values for conditional rendering
  const watchValues = useWatch({
    control: form.control,
    name: ["enable_installments", "installments_count"],
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        {/* Entry Payment Section */}
        <EntryPaymentFields
          control={form.control}
          disabled={isSubmitting}
        />

        {/* Installment Fields */}
        <InstallmentFields 
          control={form.control}
          disabled={isSubmitting}
          values={{
            enable_installments: watchValues[0],
            installments_count: watchValues[1],
          }}
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
