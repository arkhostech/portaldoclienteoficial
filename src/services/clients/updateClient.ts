
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
    
    // Verify the status is one of the valid values if it's being updated
    if (cleanData.status && 
        !["documentacao", "em_andamento", "concluido", null].includes(cleanData.status)) {
      console.error("Invalid status value:", cleanData.status);
      toast.error("Valor de status inválido");
      return null;
    }
    
    // If process_type is provided, we need to look up the process_type_id
    let updateData = { ...cleanData };
    
    if (cleanData.process_type) {
      // This might be either a process_type name or id - check if it's a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanData.process_type);
      
      if (!isUUID) {
        // It's a name, so we need to get the ID
        const { data: processType, error: processTypeError } = await supabase
          .from('process_types')
          .select('id')
          .eq('name', cleanData.process_type)
          .single();
          
        if (processTypeError || !processType) {
          console.error("Process type not found:", cleanData.process_type);
          toast.error("Tipo de processo não encontrado");
          return null;
        }
        
        // Replace process_type with process_type_id in the update data
        delete updateData.process_type;
        updateData.process_type_id = processType.id;
      } else {
        // It's already a UUID, use it directly as the process_type_id
        delete updateData.process_type;
        updateData.process_type_id = cleanData.process_type;
      }
    }
    
    console.log("Calling Supabase with:", { id, data: updateData });
    
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        process_types (
          id,
          name
        )
      `)
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
    
    // Add virtual process_type property
    const updatedClient = {
      ...data,
      process_type: data.process_types?.name || null
    };
    
    console.log("Client successfully updated:", updatedClient);
    toast.success("Cliente atualizado com sucesso");
    return updatedClient as Client;
  } catch (error) {
    console.error("Unexpected error updating client:", error);
    toast.error("Erro ao atualizar cliente");
    return null;
  }
};
