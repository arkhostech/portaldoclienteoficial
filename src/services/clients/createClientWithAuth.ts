
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client, ClientWithAuthFormData } from "./types";

export const createClientWithAuth = async (clientFormData: ClientWithAuthFormData): Promise<Client | null> => {
  try {
    console.log("Creating client with auth using edge function");
    
    // Process the process_type field to get the process_type_id
    let processTypeId = null;
    
    if (clientFormData.process_type) {
      // Check if the process_type is an ID or a name
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientFormData.process_type);
      
      if (isUUID) {
        // It's already an ID, use it directly
        processTypeId = clientFormData.process_type;
      } else {
        // It's a name, so we need to get the ID
        const { data: processType, error: processTypeError } = await supabase
          .from('process_types')
          .select('id')
          .eq('name', clientFormData.process_type)
          .single();
          
        if (processTypeError || !processType) {
          console.error("Process type not found:", clientFormData.process_type);
          toast.error("Tipo de processo não encontrado");
          return null;
        }
        
        processTypeId = processType.id;
      }
    }
    
    // Create a modified payload with process_type_id instead of process_type
    const payload = {
      ...clientFormData,
      process_type_id: processTypeId,
    };
    
    // Call the edge function to create the client with authentication
    const { data, error } = await supabase.functions.invoke<{
      data: Client;
      message: string;
      error?: string;
    }>("create-client-with-auth", {
      body: payload,
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
