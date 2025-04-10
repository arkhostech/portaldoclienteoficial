
import { supabase } from "@/integrations/supabase/client";
import { Document } from "./types";
import { createDelayedToast } from "./utils";

export const fetchClientDocuments = async (clientId: string): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching client documents:", error);
      await createDelayedToast("error", "Erro ao buscar documentos", 100);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching client documents:", error);
    await createDelayedToast("error", "Erro ao buscar documentos", 100);
    return [];
  }
};
