import { supabase } from "@/integrations/supabase/client";
import { createDelayedToast } from "./utils";

export const deleteDocument = async (documentId: string, filePath: string | null): Promise<boolean> => {
  try {
    // Delete document record from the database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      console.error("Error deleting document record:", dbError);
      await createDelayedToast("error", "Erro ao excluir documento", 300);
      return false;
    }
    
    // If there's a file associated with the document, delete it from storage
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('clientdocuments')
        .remove([filePath]);
      
      if (storageError) {
        console.error("Error deleting document file:", storageError);
        // Document record is already deleted, so we just log this error
        console.warn("Document record was deleted but file remains in storage");
      }
    }
    
    // Delay toast to prevent UI issues
    await createDelayedToast("success", "Documento excluído com sucesso", 600);
    
    return true;
  } catch (error) {
    console.error("Unexpected error deleting document:", error);
    await createDelayedToast("error", "Erro ao excluir documento", 300);
    return false;
  }
};
