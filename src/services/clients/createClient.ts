
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client, ClientFormData } from "./types";

export const createClient = async (clientData: ClientFormData): Promise<Client | null> => {
  try {
    // Create a new object without address
    let insertData: any = { 
      full_name: clientData.full_name,
      email: clientData.email,
      phone: clientData.phone,
      status: clientData.status
    };
    
    if (clientData.process_type) {
      insertData.process_type_id = clientData.process_type;
    }
    
    const { data, error } = await supabase
      .from('clients')
      .insert([insertData])
      .select(`
        *,
        process_types (
          id,
          name
        )
      `)
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
    
    // Add virtual process_type property
    const newClient = {
      ...data,
      process_type: data.process_types?.name || null
    };
    
    toast.success("Cliente criado com sucesso");
    return newClient as Client;
  } catch (error) {
    console.error("Unexpected error creating client:", error);
    toast.error("Erro ao criar cliente");
    return null;
  }
};
