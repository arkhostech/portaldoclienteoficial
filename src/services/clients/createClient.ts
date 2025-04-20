
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
      // Check if the process_type is an ID or a name
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientData.process_type);
      
      if (isUUID) {
        // It's already an ID, use it directly
        insertData.process_type_id = clientData.process_type;
      } else {
        // It's a name, so we need to get the ID
        const { data: processType, error: processTypeError } = await supabase
          .from('process_types')
          .select('id')
          .eq('name', clientData.process_type)
          .single();
          
        if (processTypeError || !processType) {
          console.error("Process type not found:", clientData.process_type);
          toast.error("Tipo de processo não encontrado");
          return null;
        }
        
        insertData.process_type_id = processType.id;
      }
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
