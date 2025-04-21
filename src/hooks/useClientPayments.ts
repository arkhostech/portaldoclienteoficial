
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface ClientPayment {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  date: string; // due_date from the database
  due_date: string;
  status: "paid" | "pending" | "overdue";
}

export function useClientPayments() {
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setTotalPaid] = useState(0);
  const { user } = useAuth();

  const fetchPayments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("scheduled_payments")
        .select("*")
        .eq("client_id", user.id)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching payments:", error);
        return;
      }

      // Transform database records to the format expected by the UI
      const transformedPayments = (data || []).map(payment => {
        const dueDate = new Date(payment.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Determine status based on paid_status and due date
        let status: "paid" | "pending" | "overdue" = "pending";
        if (payment.paid_status === "paid") {
          status = "paid";
        } else if (dueDate < today) {
          status = "overdue";
        }

        return {
          id: payment.id,
          title: payment.title,
          description: payment.description,
          amount: payment.amount,
          date: payment.due_date,
          due_date: payment.due_date,
          status
        };
      });

      setPayments(transformedPayments);
      
      // Calculate totals
      const total = transformedPayments.reduce((sum, payment) => {
        // Remove $ or R$ if present and parse as float
        const amount = parseFloat(payment.amount.replace(/[$R\s]/g, ''));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      const paid = transformedPayments
        .filter(payment => payment.status === "paid")
        .reduce((sum, payment) => {
          const amount = parseFloat(payment.amount.replace(/[$R\s]/g, ''));
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      
      setTotalAmount(total);
      setTotalPaid(paid);
      
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    
    // Set up real-time subscription to payment changes
    if (!user) return;
    
    const channel = supabase
      .channel("client-payments-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "scheduled_payments",
          filter: `client_id=eq.${user.id}`,
        },
        (_payload) => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    payments,
    isLoading,
    totalAmount,
    paidAmount,
    paymentProgress: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
  };
}
