
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "./types";

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        process_types (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erro ao buscar clientes");
      return [];
    }
    
    // Map the joined data to add a virtual process_type property
    const clientsWithProcessType = data.map(client => ({
      ...client,
      process_type: client.process_types?.name || null
    }));
    
    return clientsWithProcessType as Client[];
  } catch (error) {
    console.error("Unexpected error fetching clients:", error);
    toast.error("Erro ao buscar clientes");
    return [];
  }
};

export const fetchClientById = async (id: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        process_types (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching client:", error);
      toast.error("Erro ao buscar dados do cliente");
      return null;
    }
    
    // Add virtual process_type property
    const clientWithProcessType = {
      ...data,
      process_type: data.process_types?.name || null
    };
    
    return clientWithProcessType as Client;
  } catch (error) {
    console.error("Unexpected error fetching client:", error);
    toast.error("Erro ao buscar dados do cliente");
    return null;
  }
};
