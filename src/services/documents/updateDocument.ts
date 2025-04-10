
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentFormData } from "./types";
import { createDelayedToast } from "./utils";

export const updateDocumentMetadata = async (
  documentId: string,
  documentData: Partial<DocumentFormData>
): Promise<Document | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(documentData)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating document:", error);
      await createDelayedToast("error", "Erro ao atualizar documento", 300);
      return null;
    }
    
    // Delay toast to prevent UI issues
    await createDelayedToast("success", "Documento atualizado com sucesso", 600);
    
    return data;
  } catch (error) {
    console.error("Unexpected error updating document:", error);
    await createDelayedToast("error", "Erro ao atualizar documento", 300);
    return null;
  }
};
