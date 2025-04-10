
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Document {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  client_id: string;
  status: string;
}

export const fetchClientDocuments = async (clientId: string): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching client documents:", error);
      toast.error("Erro ao buscar documentos");
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching client documents:", error);
    toast.error("Erro ao buscar documentos");
    return [];
  }
};

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
      toast.error("Erro ao fazer upload do arquivo");
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
        
      toast.error("Erro ao criar registro do documento");
      return null;
    }
    
    toast.success("Documento enviado com sucesso");
    return data;
  } catch (error) {
    console.error("Unexpected error uploading document:", error);
    toast.error("Erro ao enviar documento");
    return null;
  }
};

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
      toast.error("Erro ao atualizar documento");
      return null;
    }
    
    toast.success("Documento atualizado com sucesso");
    return data;
  } catch (error) {
    console.error("Unexpected error updating document:", error);
    toast.error("Erro ao atualizar documento");
    return null;
  }
};

export const deleteDocument = async (documentId: string, filePath: string | null): Promise<boolean> => {
  try {
    // Delete document record from the database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      console.error("Error deleting document record:", dbError);
      toast.error("Erro ao excluir documento");
      return false;
    }
    
    // If there's a file associated with the document, delete it from storage
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('client_documents')
        .remove([filePath]);
      
      if (storageError) {
        console.error("Error deleting document file:", storageError);
        // Document record is already deleted, so we just log this error
        console.warn("Document record was deleted but file remains in storage");
      }
    }
    
    toast.success("Documento excluído com sucesso");
    return true;
  } catch (error) {
    console.error("Unexpected error deleting document:", error);
    toast.error("Erro ao excluir documento");
    return false;
  }
};

export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('client_documents')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour
    
    if (error) {
      console.error("Error getting document URL:", error);
      toast.error("Erro ao acessar o documento");
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Unexpected error getting document URL:", error);
    toast.error("Erro ao acessar o documento");
    return null;
  }
};
