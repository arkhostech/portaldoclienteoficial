
import { useState } from "react";
import { Document, DocumentFormData, uploadDocument } from "@/services/documents";
import { useTimeoutManager } from "../utils/useTimeoutManager";
import { compressImage } from "@/components/admin/documents/DocumentsUtils";

export const useDocumentUpload = (
  clientId: string | null,
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTimeout } = useTimeoutManager();

  const handleUploadDocument = async (data: DocumentFormData & { file: File }) => {
    if (!data.client_id || !data.file) return false;
    
    setIsSubmitting(true);
    
    try {
      // Process the file (compression for images)
      const processedFile = await compressImage(data.file);
      
      // Prepare document data
      const documentData: DocumentFormData = {
        title: data.title,
        description: data.description,
        client_id: data.client_id
      };
      
      const result = await uploadDocument(data.client_id, processedFile, documentData);
      
      if (result) {
        setDocuments(prevDocs => [result, ...prevDocs]);
        
        // Use managed timeout
        addTimeout(() => {
          setIsSubmitting(false);
        }, 800);
        return true;
      } else {
        addTimeout(() => {
          setIsSubmitting(false);
        }, 800);
        return false;
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      
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
