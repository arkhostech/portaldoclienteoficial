
import { useState, useEffect, useRef } from "react";
import { 
  Document, 
  DocumentFormData,
  fetchClientDocuments, 
  uploadDocument, 
  updateDocumentMetadata,
  deleteDocument,
  getDocumentUrl
} from "@/services/documentService";
import { toast } from "sonner";

export const useClientDocuments = (clientId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Dialog state
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
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

  useEffect(() => {
    if (clientId) {
      loadClientDocuments();
    }
    
    // Cleanup function
    return () => {
      clearAllTimeouts();
    };
  }, [clientId]);

  const loadClientDocuments = async () => {
    setIsLoading(true);
    const documentsData = await fetchClientDocuments(clientId);
    setDocuments(documentsData);
    setIsLoading(false);
  };

  const handleUploadDocument = async (data: DocumentFormData & { file: File }) => {
    if (!clientId || !data.file) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare document data
      const documentData: DocumentFormData = {
        title: data.title,
        description: data.description,
        status: data.status,
        client_id: clientId
      };
      
      const result = await uploadDocument(clientId, data.file, documentData);
      
      if (result) {
        setDocuments(prevDocs => [result, ...prevDocs]);
        
        // Use managed timeout
        addTimeout(() => {
          setOpenUploadDialog(false);
          setIsSubmitting(false);
        }, 800);
      } else {
        addTimeout(() => {
          setIsSubmitting(false);
        }, 800);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      
      addTimeout(() => {
        setIsSubmitting(false);
      }, 800);
    }
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setOpenEditDialog(true);
  };

  const handleUpdateDocument = async (data: Omit<DocumentFormData, 'client_id'>) => {
    if (!selectedDocument) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateDocumentMetadata(selectedDocument.id, data);
      
      if (result) {
        setDocuments(prevDocs => prevDocs.map(doc => 
          doc.id === result.id ? result : doc
        ));
        
        // Use longer delay for status changes to ensure UI updates correctly
        addTimeout(() => {
          setIsUpdating(false);
          // Note: Not closing the dialog here - letting the dialog component handle it
        }, 1000);
      } else {
        addTimeout(() => {
          setIsUpdating(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      
      addTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
  };

  const handleConfirmDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteDocument(selectedDocument.id, selectedDocument.file_path);
      
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocument.id));
        
        // Use managed timeout with longer delay
        addTimeout(() => {
          setOpenDeleteDialog(false);
          setIsDeleting(false);
        }, 800);
      } else {
        addTimeout(() => {
          setIsDeleting(false);
        }, 800);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      
      addTimeout(() => {
        setIsDeleting(false);
      }, 800);
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
    documents,
    isLoading,
    selectedDocument,
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    isSubmitting,
    isUpdating,
    isDeleting,
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    handleUploadDocument,
    handleEditDocument,
    handleUpdateDocument,
    handleConfirmDelete,
    handleDeleteDocument,
    handleDownloadDocument,
  };
};
