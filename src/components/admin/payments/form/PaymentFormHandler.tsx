
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentFormValues } from "./types";
import { addDays, addWeeks, addMonths } from "date-fns";

interface UsePaymentFormProps {
  onSuccess?: () => void;
  initialData?: PaymentFormValues & { id: string };
}

export const usePaymentFormHandler = ({ onSuccess, initialData }: UsePaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);

    try {
      // Format amount
      const formattedAmount = data.amount.startsWith("$")
        ? data.amount
        : `$${data.amount}`;

      // Convert Date to ISO string for Supabase
      const formattedDueDate = data.due_date.toISOString();

      // Initial/entry payment data
      const entryPayment = {
        client_id: data.client_id,
        title: data.title,
        amount: formattedAmount,
        due_date: formattedDueDate,
        description: data.description || null,
        paid_status: data.is_paid ? 'paid' : 'pending',
      };

      if (initialData?.id) {
        // Update existing payment
        const { error } = await supabase
          .from("scheduled_payments")
          .update({
            client_id: data.client_id,
            title: data.title,
            amount: formattedAmount,
            due_date: formattedDueDate,
            description: data.description || null,
          })
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Pagamento atualizado com sucesso");
      } else {
        // Create entry payment
        const { error: entryError } = await supabase
          .from("scheduled_payments")
          .insert(entryPayment);

        if (entryError) throw entryError;

        // Handle installments if enabled
        if (data.enable_installments && data.installments_count && data.installments_count > 0) {
          // Format installment amount
          const installmentAmount = data.installment_amount?.startsWith("$")
            ? data.installment_amount
            : `$${data.installment_amount}`;

          // Generate installment payments
          const installments = [];
          const startDate = data.first_installment_date || new Date();

          for (let i = 0; i < data.installments_count; i++) {
            let dueDate: Date;
            
            switch (data.installment_frequency) {
              case "weekly":
                dueDate = addWeeks(startDate, i);
                break;
              case "biweekly":
                dueDate = addDays(startDate, i * 14); // 14 days = 2 weeks
                break;
              case "monthly":
              default:
                dueDate = addMonths(startDate, i);
                break;
            }

            installments.push({
              client_id: data.client_id,
              title: `${data.title} - Parcela ${i + 1}/${data.installments_count}`,
              amount: installmentAmount,
              due_date: dueDate.toISOString(),
              description: data.description || null,
              paid_status: 'pending',
            });
          }

          // Insert all installments in batch
          if (installments.length > 0) {
            const { error: installmentsError } = await supabase
              .from("scheduled_payments")
              .insert(installments);

            if (installmentsError) throw installmentsError;
          }
        }

        toast.success(data.enable_installments 
          ? `Pagamento com ${data.installments_count} parcelas agendado com sucesso` 
          : "Pagamento agendado com sucesso");
      }

      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      console.error("Error saving payment:", error);
      toast.error(`Erro ao salvar pagamento: ${error.message || "Erro desconhecido"}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    onSubmit
  };
};
