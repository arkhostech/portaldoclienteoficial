
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client, ClientWithAuthFormData } from "./types";

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
