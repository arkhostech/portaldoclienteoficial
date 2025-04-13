
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentFormValues } from "./types";
import { Client } from "@/services/clients/types";

interface UsePaymentFormProps {
  onSuccess?: () => void;
  initialData?: PaymentFormValues & { id: string };
}

export const usePaymentFormHandler = ({ onSuccess, initialData }: UsePaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);

    try {
      // Format amount if necessary (add currency symbol, etc.)
      const formattedAmount = data.amount.startsWith("$")
        ? data.amount
        : `$${data.amount}`;

      // Convert Date to ISO string for Supabase
      const formattedDueDate = data.due_date.toISOString();

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
        // Create new payment
        const { error } = await supabase.from("scheduled_payments").insert({
          client_id: data.client_id,
          title: data.title,
          amount: formattedAmount,
          due_date: formattedDueDate,
          description: data.description || null,
        });

        if (error) throw error;
        toast.success("Pagamento agendado com sucesso");
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
