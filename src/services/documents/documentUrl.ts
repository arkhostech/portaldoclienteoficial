
import { supabase } from "@/integrations/supabase/client";
import { createDelayedToast } from "./utils";

export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  // Input validation
  if (!filePath || typeof filePath !== 'string' || filePath.trim() === '') {
    console.error("Invalid file path provided:", filePath);
    await createDelayedToast("error", "Caminho do arquivo inválido", 100);
    return null;
  }

  try {
    console.log("Getting document URL for:", filePath);
    
    const { data, error } = await supabase.storage
      .from('client_documents')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour
    
    if (error) {
      console.error("Error getting document URL:", error);
      console.error("Error details:", {
        statusCode: error.status,
        errorMessage: error.message,
        filePath
      });
      
      await createDelayedToast("error", "Erro ao acessar o documento", 100);
      return null;
    }
    
    if (!data?.signedUrl) {
      console.error("No signed URL returned despite no error", { filePath });
      await createDelayedToast("error", "Erro ao gerar URL do documento", 100);
      return null;
    }
    
    console.log("Successfully generated signed URL");
    return data.signedUrl;
  } catch (error) {
    console.error("Unexpected error getting document URL:", error);
    console.error("Error context:", { filePath });
    await createDelayedToast("error", "Erro ao acessar o documento", 100);
    return null;
  }
};
