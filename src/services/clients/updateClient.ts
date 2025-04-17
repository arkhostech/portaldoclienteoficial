
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client, ClientFormData } from "./types";

export const updateClient = async (id: string, clientData: Partial<ClientFormData>): Promise<Client | null> => {
  try {
    console.log(`In updateClient service - Updating client ${id} with data:`, clientData);
    
    // Check if we've got a valid id
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error("Invalid client ID:", id);
      toast.error("ID do cliente inválido");
      return null;
    }
    
    // Clean up the data - make sure we're not sending undefined values
    const cleanData = Object.fromEntries(
      Object.entries(clientData).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanData).length === 0) {
      console.error("No valid data to update");
      toast.error("Nenhum dado válido para atualizar");
      return null;
    }
    
    const { data, error } = await supabase
      .from('clients')
      .update(cleanData)
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
    
    console.log("Client successfully updated:", data);
    toast.success("Cliente atualizado com sucesso");
    return data as Client;
  } catch (error) {
    console.error("Unexpected error updating client:", error);
    toast.error("Erro ao atualizar cliente");
    return null;
  }
};
