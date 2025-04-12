
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

export interface ClientWithAuthFormData extends ClientFormData {
  password: string;
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

export const createClientWithAuth = async (clientFormData: ClientWithAuthFormData): Promise<Client | null> => {
  try {
    // Create a separate connection to check if email already exists without using the admin's session
    const tempClient = supabase.auth.signUp({
      email: clientFormData.email,
      password: clientFormData.password,
      options: {
        data: {
          full_name: clientFormData.full_name
        }
      }
    });
    
    const { error: signUpError, data: signUpData } = await tempClient;
    
    if (signUpError) {
      console.error("Error checking existing user:", signUpError);
      
      // If the error is that the user already exists, show a specific message
      if (signUpError.message.includes("email already") || 
          signUpError.message.includes("User already registered")) {
        toast.error("Este email já está cadastrado no sistema de autenticação");
        return null;
      }
      
      // Handle password validation errors
      if (signUpError.message.includes("Password")) {
        toast.error("Senha inválida: mínimo de 6 caracteres");
        return null;
      } 
      
      // Handle email validation errors
      if (signUpError.message.includes("email")) {
        toast.error("Email inválido");
        return null;
      }
      
      // Generic error
      toast.error("Erro ao verificar usuário existente");
      return null;
    }
    
    // If sign-up was successful, get the user ID from the response
    if (!signUpData.user) {
      toast.error("Erro ao obter dados do usuário criado");
      return null;
    }
    
    // Create the client record with the user ID
    const { password, ...clientDataWithoutPassword } = clientFormData;
    
    const clientWithId = {
      ...clientDataWithoutPassword,
      id: signUpData.user.id
    };
    
    const { data: newClientData, error: clientError } = await supabase
      .from('clients')
      .insert([clientWithId])
      .select()
      .single();
    
    if (clientError) {
      console.error("Error creating client record:", clientError);
      toast.error("Erro ao criar registro do cliente");
      return null;
    }
    
    toast.success("Cliente criado com sucesso com acesso ao portal");
    return newClientData;
  } catch (error) {
    console.error("Unexpected error creating client with auth:", error);
    toast.error("Erro ao criar cliente com autenticação");
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
