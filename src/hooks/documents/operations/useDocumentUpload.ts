
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
    console.log("Starting document upload process for file:", data.file.name);
    
    try {
      // Process the file (compression for images)
      const processedFile = await compressImage(data.file);
      console.log("File processed and ready for upload");
      
      // Use file name as title if no title is provided
      const documentData: DocumentFormData = {
        title: data.title?.trim() || data.file.name,
        description: data.description,
        client_id: data.client_id
      };
      
      console.log("Uploading document with data:", documentData);
      const result = await uploadDocument(data.client_id, processedFile, documentData);
      
      if (result) {
        console.log("Document uploaded successfully:", result);
        setDocuments(prevDocs => [result, ...prevDocs]);
        
        addTimeout(() => {
          setIsSubmitting(false);
        }, 800);
        return true;
      } else {
        console.error("Upload failed - no result returned from uploadDocument");
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
