
import { useState } from "react";
import { Document, deleteDocument } from "@/services/documents";
import { useTimeoutManager } from "../utils/useTimeoutManager";

export const useDocumentDelete = (
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  selectedDocument: Document | null
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addTimeout } = useTimeoutManager();

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return false;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteDocument(selectedDocument.id, selectedDocument.file_path);
      
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocument.id));
        
        // Use managed timeout with longer delay
        addTimeout(() => {
          setIsDeleting(false);
        }, 800);
        return true;
      } else {
        addTimeout(() => {
          setIsDeleting(false);
        }, 800);
        return false;
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      
      addTimeout(() => {
        setIsDeleting(false);
      }, 800);
      return false;
    }
  };

  return {
    isDeleting,
    handleDeleteDocument
  };
};
