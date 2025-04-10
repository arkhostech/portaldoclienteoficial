
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
}

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

export const createClient = async (clientData: ClientFormData): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating client:", error);
      
      if (error.code === "23505") {
        toast.error("Este email já está em uso");
      } else {
        toast.error("Erro ao criar cliente");
      }
      return null;
    }
    
    toast.success("Cliente criado com sucesso");
    return data;
  } catch (error) {
    console.error("Unexpected error creating client:", error);
    toast.error("Erro ao criar cliente");
    return null;
  }
};

export const updateClient = async (id: string, clientData: ClientFormData): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating client:", error);
      
      if (error.code === "23505") {
        toast.error("Este email já está em uso");
      } else {
        toast.error("Erro ao atualizar cliente");
      }
      return null;
    }
    
    toast.success("Cliente atualizado com sucesso");
    return data;
  } catch (error) {
    console.error("Unexpected error updating client:", error);
    toast.error("Erro ao atualizar cliente");
    return null;
  }
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
      return false;
    }
    
    toast.success("Cliente excluído com sucesso");
    return true;
  } catch (error) {
    console.error("Unexpected error deleting client:", error);
    toast.error("Erro ao excluir cliente");
    return false;
  }
};
