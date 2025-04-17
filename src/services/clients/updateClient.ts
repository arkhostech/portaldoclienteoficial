
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client, ClientFormData } from "./types";

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
    return data as Client;
  } catch (error) {
    console.error("Unexpected error updating client:", error);
    toast.error("Erro ao atualizar cliente");
    return null;
  }
};
