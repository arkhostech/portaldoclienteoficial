
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
    
    // Check auth status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData?.session?.user;
    console.log("User authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated");
    
    if (!isAuthenticated) {
      console.error("User is not authenticated");
      await createDelayedToast("error", "Usuário não autenticado", 100);
      return null;
    }
    
    // Log storage bucket info for debugging
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('client_documents');
      if (bucketError) {
        console.error("Error getting bucket info:", bucketError);
      } else {
        console.log("Bucket info:", bucketData);
      }
    } catch (bucketErr) {
      console.error("Unexpected error checking bucket:", bucketErr);
    }
    
    // Try to create signed URL - reduced to 60 seconds for security
    console.log("Creating signed URL for path:", filePath);
    const { data, error } = await supabase.storage
      .from('client_documents')
      .createSignedUrl(filePath, 60); // URL valid for 60 seconds
    
    if (error) {
      console.error("Error getting document URL:", error);
      console.error("Error details:", {
        errorMessage: error.message,
        filePath,
        userId: sessionData?.session?.user?.id || 'unknown'
      });
      
      await createDelayedToast("error", "Erro ao acessar o documento", 100);
      return null;
    }
    
    if (!data?.signedUrl) {
      console.error("No signed URL returned despite no error", { 
        filePath,
        userId: sessionData?.session?.user?.id || 'unknown'
      });
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
