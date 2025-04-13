
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

  // Fetch all payments
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_payments")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Add client names to payments for display
      const paymentsWithClientNames = await Promise.all(
        (data || []).map(async (payment) => {
          const client = clients.find((c) => c.id === payment.client_id);
          return {
            ...payment,
            client_name: client?.full_name || "Cliente Desconhecido",
            due_date: payment.due_date, // Ensure due_date is included
          };
        })
      );

      setPayments(paymentsWithClientNames);
      
      // Group payments by client
      const grouped = paymentsWithClientNames.reduce<Record<string, ScheduledPayment[]>>((acc, payment) => {
        if (!acc[payment.client_id]) {
          acc[payment.client_id] = [];
        }
        acc[payment.client_id].push(payment);
        return acc;
      }, {});
      
      setGroupedPayments(grouped);
      
      // Sort client IDs by client name
      const sortedIds = Object.keys(grouped).sort((a, b) => {
        const clientA = clients.find(c => c.id === a);
        const clientB = clients.find(c => c.id === b);
        return (clientA?.full_name || "").localeCompare(clientB?.full_name || "");
      });
      
      setSortedClientIds(sortedIds);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Erro",
        description: "Erro ao buscar pagamentos agendados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment deletion
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pagamento?")) {
      try {
        const { error } = await supabase
          .from("scheduled_payments")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Pagamento excluído com sucesso",
          variant: "default"
        });
        fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir pagamento",
          variant: "destructive"
        });
      }
    }
  };

  // Load payments when clients are available
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
  };
}

export type { ScheduledPayment };
