
import { useState } from "react";
import { Document, DocumentFormData, uploadDocument } from "@/services/documents";
import { useTimeoutManager } from "../utils/useTimeoutManager";
import { compressImage } from "@/components/admin/documents/DocumentsUtils";
import { toast } from "sonner";

export const useDocumentUpload = (
  clientId: string | null,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTimeout } = useTimeoutManager();

  const handleUploadDocument = async (data: DocumentFormData & { file: File }) => {
    if (!data.client_id || !data.file) {
      console.error("Missing required data for upload:", { clientId: data.client_id, fileExists: !!data.file });
      toast.error("Dados insuficientes para upload");
      return false;
    }
    
    setIsSubmitting(true);
    console.log("Starting document upload process for file:", data.file.name);
    console.log("Full upload data:", {
      clientId: data.client_id,
      title: data.title || data.file.name,
      description: data.description,
      fileName: data.file.name,
      fileSize: data.file.size,
      fileType: data.file.type
    });
    
    try {
      // Process the file (compression for images)
      const processedFile = await compressImage(data.file);
      console.log("File processed and ready for upload");
      
      // Use title from data or file name if title is empty
      const documentData: DocumentFormData = {
        title: data.title || data.file.name,
        description: data.description,
        client_id: data.client_id
      };
      
      console.log("Uploading document with data:", documentData);
      const result = await uploadDocument(data.client_id, processedFile, documentData);
      
      if (result) {
        console.log("Document uploaded successfully:", result);
        toast.success("Documento enviado com sucesso");
        setDocuments(prevDocs => [result, ...prevDocs]);
        
        addTimeout(() => {
          setIsSubmitting(false);
        }, 800);
        return true;
      } else {
        console.error("Upload failed - no result returned from uploadDocument");
        toast.error("Falha no upload do documento");
        
        addTimeout(() => {
          setIsSubmitting(false);
        }, 800);
        return false;
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erro ao enviar documento");
      
      addTimeout(() => {
        setIsSubmitting(false);
      }, 800);
      return false;
    }
  };

  return {
    isSubmitting,
    handleUploadDocument
  };
};
