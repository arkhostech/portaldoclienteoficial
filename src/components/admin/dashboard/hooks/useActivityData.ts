
import { useState, useEffect } from "react";
import { Payment, Client } from "../types/activity";
import { supabase } from "@/integrations/supabase/client";

export const useActivityData = () => {
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [newClients, setNewClients] = useState<Client[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("scheduled_payments")
          .select(`
            id,
            title,
            amount,
            due_date,
            description,
            client_id,
            clients(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (paymentsError) throw paymentsError;
        
        const formattedRecentPayments = paymentsData?.map(payment => ({
          id: payment.id,
          client_name: payment.clients?.full_name || 'Cliente não encontrado',
          title: payment.title,
          value: payment.amount,
          due_date: payment.due_date,
        })) || [];
        
        setRecentPayments(formattedRecentPayments);
        
        // Fetch new clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select(`
            id, 
            full_name, 
            email, 
            process_type_id, 
            process_types(name),
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (clientsError) throw clientsError;
        
        const formattedNewClients = clientsData?.map(client => ({
          id: client.id,
          name: client.full_name,
          email: client.email,
          process_type: client.process_types?.name || null,
          date: client.created_at,
        })) || [];
        
        setNewClients(formattedNewClients);
        
        // Fetch upcoming payments
        const today = new Date();
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("scheduled_payments")
          .select(`
            id,
            title,
            amount,
            due_date,
            description,
            client_id,
            clients(full_name)
          `)
          .gte('due_date', today.toISOString().split('T')[0])
          .order('due_date', { ascending: true })
          .limit(5);
        
        if (upcomingError) throw upcomingError;
        
        const formattedUpcomingPayments = upcomingData?.map(payment => ({
          id: payment.id,
          client_name: payment.clients?.full_name || 'Cliente não encontrado',
          title: payment.title,
          value: payment.amount,
          due_date: payment.due_date,
        })) || [];
        
        setUpcomingPayments(formattedUpcomingPayments);
        
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityData();
  }, []);

  return {
    recentPayments,
    newClients,
    upcomingPayments,
    isLoading
  };
};
