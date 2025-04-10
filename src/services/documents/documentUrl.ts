
import { supabase } from "@/integrations/supabase/client";
import { createDelayedToast } from "./utils";

export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('client_documents')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour
    
    if (error) {
      console.error("Error getting document URL:", error);
      await createDelayedToast("error", "Erro ao acessar o documento", 100);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Unexpected error getting document URL:", error);
    await createDelayedToast("error", "Erro ao acessar o documento", 100);
    return null;
  }
};
