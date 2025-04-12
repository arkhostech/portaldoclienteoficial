
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "./types";

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erro ao buscar clientes");
      return [];
    }
    
    return data || [];
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
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching client:", error);
      toast.error("Erro ao buscar dados do cliente");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error fetching client:", error);
    toast.error("Erro ao buscar dados do cliente");
    return null;
  }
};
