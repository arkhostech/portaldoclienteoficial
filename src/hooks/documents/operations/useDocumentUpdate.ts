
import { useState } from "react";
import { Document, DocumentFormData, updateDocumentMetadata } from "@/services/documents";
import { useTimeoutManager } from "../utils/useTimeoutManager";

export const useDocumentUpdate = (
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  selectedDocument: Document | null
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { addTimeout } = useTimeoutManager();

  const handleUpdateDocument = async (data: Omit<DocumentFormData, 'client_id'>) => {
    if (!selectedDocument) return false;
    
    setIsUpdating(true);
    
    try {
      const result = await updateDocumentMetadata(selectedDocument.id, data);
      
      if (result) {
        setDocuments(prevDocs => prevDocs.map(doc => 
          doc.id === result.id ? result : doc
        ));
        
        addTimeout(() => {
          setIsUpdating(false);
        }, 1000);
        return true;
      } else {
        addTimeout(() => {
          setIsUpdating(false);
        }, 1000);
        return false;
      }
    } catch (error) {
      console.error("Error updating document:", error);
      
      addTimeout(() => {
        setIsUpdating(false);
        }, 1000);
      return false;
    }
  };

  return {
    isUpdating,
    handleUpdateDocument
  };
};
