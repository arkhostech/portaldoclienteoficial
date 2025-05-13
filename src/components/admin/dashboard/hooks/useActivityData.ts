
import { useState, useEffect } from "react";
import { Client } from "../types/activity";
import { supabase } from "@/integrations/supabase/client";

export const useActivityData = () => {
  const [newClients, setNewClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      try {
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
        
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityData();
    
    // Set up realtime subscription for changes
    const channel = supabase
      .channel('activity-data-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
      }, () => {
        fetchActivityData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    newClients,
    isLoading,
  };
};
