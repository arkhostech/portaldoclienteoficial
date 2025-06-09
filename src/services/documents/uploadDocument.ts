import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentFormData } from "./types";
import { createDelayedToast } from "./utils";

// Function to sanitize file names
const sanitizeFileName = (fileName: string): string => {
  // Get file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  
  // Remove emojis, special characters, and accents
  let sanitized = name
    // Remove emojis (Unicode ranges for various emoji blocks)
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Remove accents and normalize
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Remove special characters except letters, numbers, spaces, hyphens, underscores
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim spaces
    .trim()
    // Replace spaces with underscores
    .replace(/\s/g, '_');
  
  // Limit length to 50 characters
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }
  
  // If name becomes empty, use a default
  if (!sanitized) {
    sanitized = 'document';
  }
  
  return sanitized + extension;
};

export const uploadDocument = async (
  clientId: string,
  file: File,
  documentData: DocumentFormData,
  uploadedBy: 'admin' | 'client' = 'admin'
): Promise<Document | null> => {
  try {
    console.log("Uploading document for clientId:", clientId);
    console.log("Document data:", documentData);
    
    // Sanitize the file name
    const sanitizedFileName = sanitizeFileName(file.name);
    console.log("Original file name:", file.name);
    console.log("Sanitized file name:", sanitizedFileName);
    
    // Generate a unique file path with sanitized name
    const filePath = `${clientId}/${Date.now()}_${sanitizedFileName}`;
    console.log("Generated file path:", filePath);
    
    // Upload the file to storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('clientdocuments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      
      // Check for specific storage errors
      if (uploadError.message.includes('Permission denied')) {
        await createDelayedToast("error", "Permissão negada para upload do arquivo", 300);
      } else {
        await createDelayedToast("error", "Erro ao fazer upload do arquivo", 300);
      }
      return null;
    }
    
    console.log("File uploaded successfully");
    
    // Create document record in the database with explicit client_id
    const documentRecord = {
      ...documentData,
      client_id: clientId, // Explicitly set client_id to ensure it's included
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: uploadedBy
    };
    
    console.log("Creating document record:", documentRecord);
    
    const { data, error } = await supabase
      .from('documents')
      .insert([documentRecord])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating document record:", error);
      
      // Handle RLS policy violations
      if (error.code === 'PGRST116') {
        await createDelayedToast("error", "Permissão negada para criar documento", 300);
      } else {
        await createDelayedToast("error", "Erro ao criar registro do documento", 300);
      }
      
      // Delete the uploaded file since the document record failed
      await supabase.storage
        .from('clientdocuments')
        .remove([filePath]);
      
      return null;
    }
    
    console.log("Document record created successfully:", data);
    
    // Delay toast to prevent UI issues
    await createDelayedToast("success", "Documento enviado com sucesso", 600);
    
    return data;
  } catch (error) {
    console.error("Unexpected error uploading document:", error);
    await createDelayedToast("error", "Erro ao enviar documento", 300);
    return null;
  }
};
