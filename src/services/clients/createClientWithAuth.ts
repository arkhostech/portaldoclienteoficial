
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client, ClientWithAuthFormData } from "./types";

export const createClientWithAuth = async (clientFormData: ClientWithAuthFormData): Promise<Client | null> => {
  try {
    console.log("Creating client with auth using edge function");
    
    // Call the edge function to create the client with authentication
    const { data, error } = await supabase.functions.invoke<{
      data: Client;
      message: string;
      error?: string;
    }>("create-client-with-auth", {
      body: clientFormData,
    });
    
    // Handle edge function errors
    if (error) {
      console.error("Edge function error:", error);
      toast.error(error.message || "Erro ao criar cliente com autenticação");
      return null;
    }
    
    // Handle application errors returned from the edge function
    if (!data || data.error) {
      console.error("Application error:", data?.error || "Unknown error");
      toast.error(data?.error || "Erro ao criar cliente com autenticação");
      return null;
    }
    
    // Success case
    toast.success(data.message || "Cliente criado com sucesso com acesso ao portal");
    return data.data;
  } catch (error) {
    console.error("Unexpected error creating client with auth:", error);
    toast.error("Erro ao criar cliente com autenticação");
    return null;
  }
};
