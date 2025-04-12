
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin-client";
import { toast } from "sonner";
import { Client, ClientWithAuthFormData } from "./types";

export const createClientWithAuth = async (clientFormData: ClientWithAuthFormData): Promise<Client | null> => {
  try {
    console.log("Creating client with auth using admin client");
    
    // Use the admin client with service role for auth operations
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: clientFormData.email,
      password: clientFormData.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: clientFormData.full_name,
        role: 'client' // Explicitly set role in metadata
      },
      app_metadata: {
        role: 'client' // Set role in app_metadata as well
      }
    });
    
    if (authError) {
      console.error("Error creating auth user:", authError);
      
      // Handle specific error messages
      if (authError.message.includes("already registered") || 
          authError.message.includes("email already")) {
        toast.error("Este email já está cadastrado no sistema de autenticação");
        return null;
      }
      
      if (authError.message.includes("Password")) {
        toast.error("Senha inválida: mínimo de 6 caracteres");
        return null;
      } 
      
      if (authError.message.includes("email")) {
        toast.error("Email inválido");
        return null;
      }
      
      // Generic error
      toast.error("Erro ao criar usuário: " + authError.message);
      return null;
    }
    
    if (!authData.user) {
      toast.error("Erro ao obter dados do usuário criado");
      return null;
    }
    
    console.log("Auth user created successfully:", authData.user.id);
    
    // Create the client record with the user ID
    const { password, ...clientDataWithoutPassword } = clientFormData;
    
    const clientWithId = {
      ...clientDataWithoutPassword,
      id: authData.user.id
    };
    
    console.log("Creating client record in database");
    
    // Create client record in the clients table
    // We can use the regular client here as we have RLS policies in place
    const { data: newClientData, error: clientError } = await supabase
      .from('clients')
      .insert([clientWithId])
      .select()
      .single();
    
    if (clientError) {
      console.error("Error creating client record:", clientError);
      
      // If the client record creation fails, we should clean up by deleting the auth user
      // Use supabaseAdmin for this operation
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      toast.error("Erro ao criar registro do cliente: " + clientError.message);
      return null;
    }
    
    console.log("Client record created successfully");
    toast.success("Cliente criado com sucesso com acesso ao portal");
    return newClientData;
  } catch (error) {
    console.error("Unexpected error creating client with auth:", error);
    toast.error("Erro ao criar cliente com autenticação");
    return null;
  }
};
