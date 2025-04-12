
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

export const createClientWithAuth = async (clientData: ClientWithAuthFormData): Promise<Client | null> => {
  try {
    // First check if the email is already in use in Auth
    const { data: authUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error("Error checking existing user:", checkError);
      toast.error("Erro ao verificar usuário existente");
      return null;
    }
    
    // Check if the email exists in the returned users
    // Define the type of user objects explicitly to avoid the "email" property error
    const emailExists = authUsers?.users?.some((user: { email?: string }) => user.email === clientData.email);
    
    if (emailExists) {
      toast.error("Este email já está cadastrado no sistema de autenticação");
      return null;
    }

    // Start a transaction by creating the auth user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: clientData.email,
      password: clientData.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: clientData.full_name
      }
    });

    if (userError) {
      console.error("Error creating auth user:", userError);
      
      if (userError.message.includes("Password")) {
        toast.error("Senha inválida: mínimo de 6 caracteres");
      } else if (userError.message.includes("email")) {
        toast.error("Email inválido ou já cadastrado");
      } else {
        toast.error("Erro ao criar autenticação para o cliente");
      }
      return null;
    }

    // If auth user is created successfully, create the client record with the same ID
    const { password, ...clientDataWithoutPassword } = clientData;
    
    // Use the auth user ID as the client ID
    const clientWithId = {
      ...clientDataWithoutPassword,
      id: userData.user.id
    };
    
    const { data: newClientData, error: clientError } = await supabase
      .from('clients')
      .insert([clientWithId])
      .select()
      .single();
    
    if (clientError) {
      console.error("Error creating client record:", clientError);
      
      // If client creation fails, attempt to delete the auth user to maintain consistency
      await supabase.auth.admin.deleteUser(userData.user.id);
      
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
