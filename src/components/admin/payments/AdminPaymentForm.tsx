
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client } from "@/services/clients/types";
import { Form } from "@/components/ui/form";

import { paymentSchema, PaymentFormValues } from "./form/types";
import { usePaymentFormHandler } from "./form/PaymentFormHandler";
import { 
  ClientSelectField, 
  TitleField, 
  TotalAmountField,
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
  const { isSubmitting, onSubmit } = usePaymentFormHandler({ onSuccess, initialData });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      client_id: "",
      title: "",
      total_amount: "",
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

  const watchValues = useWatch({
    control: form.control,
    name: [
      "enable_installments", 
      "installments_count", 
      "amount", 
      "total_amount"
    ],
  });

  // Watch para desabilitar campos de parcela se for pagamento à vista
  const isPaymentAVista =
    watchValues[1] === 0 &&
    !watchValues[0] &&
    !!watchValues[3] &&
    !!watchValues[2] &&
    parseFloat(watchValues[2]) === parseFloat(watchValues[3]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <ClientSelectField 
          control={form.control}
          clients={clients}
          disabled={isSubmitting}
        />

        <TitleField 
          control={form.control}
          disabled={isSubmitting}
        />

        {/* NOVO: Valor Total */}
        <TotalAmountField
          control={form.control}
          disabled={isSubmitting}
        />

        <EntryPaymentFields
          control={form.control}
          disabled={isSubmitting}
        />

        {/* Somente mostra o campo de parcelas se não for a vista */}
        {!isPaymentAVista && (
          <InstallmentFields 
            control={form.control}
            disabled={isSubmitting}
            values={{
              enable_installments: watchValues[0],
              installments_count: watchValues[1],
              amount: watchValues[2],
              total_amount: watchValues[3],
            }}
          />
        )}

        <DescriptionField 
          control={form.control}
          disabled={isSubmitting}
        />

        <SubmitButton 
          isSubmitting={isSubmitting}
          isEditMode={!!initialData?.id}
        />
      </form>
    </Form>
  );
}
