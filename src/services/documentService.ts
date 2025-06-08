import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentFormData } from "@/types/document";
import { toast } from "sonner";

// Fetch all documents for a client
export const fetchClientDocuments = async (clientId: string): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching documents:", error);
      toast.error("Falha ao carregar documentos");
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Falha ao carregar documentos");
    return [];
  }
};

// Upload a new document
export const uploadDocument = async (
  file: File,
  documentData: DocumentFormData
): Promise<Document | null> => {
  try {
    // Generate a unique file path
    const filePath = `${documentData.client_id}/${Date.now()}_${file.name}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('clientdocuments')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error("File upload error:", uploadError);
      toast.error("Falha ao enviar arquivo");
      return null;
    }
    
    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single();
    
    if (error) {
      console.error("Document creation error:", error);
      // Clean up the uploaded file
      await supabase.storage
        .from('clientdocuments')
        .remove([filePath]);
        
      toast.error("Falha ao criar registro do documento");
      return null;
    }
    
    toast.success("Documento enviado com sucesso");
    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Falha ao processar documento");
    return null;
  }
};

// Update document metadata
export const updateDocument = async (
  documentId: string,
  updates: Partial<DocumentFormData>
): Promise<Document | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) {
      console.error("Document update error:", error);
      toast.error("Falha ao atualizar documento");
      return null;
    }
    
    toast.success("Documento atualizado com sucesso");
    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Falha ao atualizar documento");
    return null;
  }
};

// Delete document
export const deleteDocument = async (documentId: string, filePath: string | null): Promise<boolean> => {
  try {
    // Delete the document record
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      console.error("Document deletion error:", dbError);
      toast.error("Falha ao excluir documento");
      return false;
    }
    
    // If there's a file, delete it from storage
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('clientdocuments')
        .remove([filePath]);
      
      if (storageError) {
        console.error("File deletion error:", storageError);
        // Document is already deleted, just log this error
      }
    }
    
    toast.success("Documento excluído com sucesso");
    return true;
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Falha ao excluir documento");
    return false;
  }
};

// Get a signed URL for downloading a document
export const getDocumentDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('clientdocuments')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour
    
    if (error) {
      console.error("Error getting download URL:", error);
      toast.error("Falha ao gerar link para download");
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Unexpected error:", error);
    toast.error("Falha ao acessar arquivo");
    return null;
  }
};
