
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentFormData } from "./types";
import { createDelayedToast } from "./utils";

export const uploadDocument = async (
  clientId: string,
  file: File,
  documentData: DocumentFormData
): Promise<Document | null> => {
  try {
    // Generate a unique file path
    const filePath = `${clientId}/${Date.now()}_${file.name}`;
    
    // Upload the file to storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('client_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      await createDelayedToast("error", "Erro ao fazer upload do arquivo", 300);
      return null;
    }
    
    // Create document record in the database
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...documentData,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating document record:", error);
      // Delete the uploaded file since the document record failed
      await supabase.storage
        .from('client_documents')
        .remove([filePath]);
      
      await createDelayedToast("error", "Erro ao criar registro do documento", 300);
      return null;
    }
    
    // Delay toast to prevent UI issues
    await createDelayedToast("success", "Documento enviado com sucesso", 600);
    
    return data;
  } catch (error) {
    console.error("Unexpected error uploading document:", error);
    await createDelayedToast("error", "Erro ao enviar documento", 300);
    return null;
  }
};
