import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/services/clients/types";

interface ScheduledPayment {
  id: string;
  client_id: string;
  title: string;
  amount: string;
  due_date: string;
  description: string | null;
  created_at: string;
  client_name?: string;
}

export function usePayments(clients: Client[]) {
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedPayments, setGroupedPayments] = useState<Record<string, ScheduledPayment[]>>({});
  const [sortedClientIds, setSortedClientIds] = useState<string[]>([]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_payments")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;

      const paymentsWithClientNames = await Promise.all(
        (data || []).map(async (payment) => {
          const client = clients.find((c) => c.id === payment.client_id);
          return {
            ...payment,
            client_name: client?.full_name || "Cliente Desconhecido",
            due_date: payment.due_date,
          };
        })
      );

      setPayments(paymentsWithClientNames);
      
      const grouped = paymentsWithClientNames.reduce<Record<string, ScheduledPayment[]>>((acc, payment) => {
        if (!acc[payment.client_id]) {
          acc[payment.client_id] = [];
        }
        acc[payment.client_id].push(payment);
        return acc;
      }, {});
      
      setGroupedPayments(grouped);
      
      const sortedIds = Object.keys(grouped).sort((a, b) => {
        const clientA = clients.find(c => c.id === a);
        const clientB = clients.find(c => c.id === b);
        return (clientA?.full_name || "").localeCompare(clientB?.full_name || "");
      });
      
      setSortedClientIds(sortedIds);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Erro ao buscar pagamentos agendados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pagamento?")) {
      try {
        const { error } = await supabase
          .from("scheduled_payments")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Pagamento excluído com sucesso");
        fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Erro ao excluir pagamento");
      }
    }
  };

  const togglePaidStatus = async (id: string, paid: boolean) => {
    try {
      const { error } = await supabase
        .from("scheduled_payments")
        .update({ paid_status: paid ? "paid" : "pending" })
        .eq("id", id);
      if (error) throw error;
      toast.success(
        paid
          ? "Marcado como pago!"
          : "Pagamento marcado como pendente."
      );
      fetchPayments();
    } catch (error) {
      console.error("Error updating paid status:", error);
      toast.error("Erro ao atualizar status de pagamento");
    }
  };

  useEffect(() => {
    if (clients.length > 0) {
      fetchPayments();
    }
  }, [clients]);

  return {
    payments,
    isLoading,
    groupedPayments,
    sortedClientIds,
    handleDelete,
    fetchPayments,
    togglePaidStatus,
  };
}

export type { ScheduledPayment };
