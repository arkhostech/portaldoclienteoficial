
import { useState, useRef } from "react";
import { 
  Document, 
  DocumentFormData,
  uploadDocument,
  updateDocumentMetadata,
  deleteDocument,
  getDocumentUrl 
} from "@/services/documents";
import { toast } from "sonner";

export const useDocumentOperations = (
  clientId: string | null,
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  selectedDocument: Document | null
) => {
  // Operation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Cleanup for timeouts
  const timeoutRefs = useRef<Array<NodeJS.Timeout>>([]);

  // Cleanup function to clear any pending timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  };

  // Add a timeout with automatic tracking for cleanup
  const addTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      // Remove this timeout from the refs array when it executes
      timeoutRefs.current = timeoutRefs.current.filter(t => t !== timeoutId);
      callback();
    }, delay);
    
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  const handleUploadDocument = async (data: DocumentFormData & { file: File }) => {
    if (!data.client_id || !data.file) return false;
    
    setIsSubmitting(true);
    
    try {
      // Prepare document data
      const documentData: DocumentFormData = {
        title: data.title,
        description: data.description,
        client_id: data.client_id
      };
      
      const result = await uploadDocument(data.client_id, data.file, documentData);
      
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

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    // Show loading toast
    const toastId = toast.loading("Preparando o download...");
    
    try {
      const url = await getDocumentUrl(document.file_path);
      
      if (url) {
        // Dismiss the loading toast
        toast.dismiss(toastId);
        toast.success("Download iniciado");
        
        // Open in a new tab to avoid navigation issues
        const win = window.open(url, '_blank');
        if (win) win.focus();
      } else {
        toast.dismiss(toastId);
        toast.error("Erro ao gerar link para download");
      }
    } catch (error) {
      console.error("Error getting document URL:", error);
      toast.dismiss(toastId);
      toast.error("Erro ao acessar o documento");
    }
  };

  return {
    isSubmitting,
    isUpdating,
    isDeleting,
    handleUploadDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    clearAllTimeouts
  };
};
