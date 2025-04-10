
import { supabase } from "@/integrations/supabase/client";
import { Document } from "./types";
import { createDelayedToast } from "./utils";

export const fetchDocuments = async (clientId: string | null = null): Promise<Document[]> => {
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by client_id if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching documents:", error);
      await createDelayedToast("error", "Erro ao buscar documentos", 100);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching documents:", error);
    await createDelayedToast("error", "Erro ao buscar documentos", 100);
    return [];
  }
};
