
import { useState, useEffect, useRef } from "react";
import { Document, fetchDocuments, uploadDocument, updateDocumentMetadata, deleteDocument, getDocumentUrl } from "@/services/documents";
import { toast } from "sonner";

export const useDocuments = (clientId: string | null = null) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Dialog states
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Operation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Timeout refs for cleanup
  const timeoutRefs = useRef<Array<NodeJS.Timeout>>([]);
  
  // Load documents when component mounts or clientId changes
  useEffect(() => {
    loadDocuments();
  }, [clientId]);
  
  // Cleanup function for when the component unmounts
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);
  
  // Add a timeout with automatic tracking for cleanup
  const addTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      timeoutRefs.current = timeoutRefs.current.filter(t => t !== timeoutId);
      callback();
    }, delay);
    
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };
  
  // Cleanup function to clear any pending timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const documentsData = await fetchDocuments(clientId);
      setDocuments(documentsData);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Erro ao carregar documentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (data: { 
    title: string; 
    description?: string; 
    client_id: string;
    file: File;
  }) => {
    setIsSubmitting(true);
    
    try {
      const result = await uploadDocument(data.client_id, data.file, {
        title: data.title,
        description: data.description,
        client_id: data.client_id
      });
      
      if (result) {
        setDocuments(prevDocs => [result, ...prevDocs]);
        setOpenUploadDialog(false);
        
        // Use managed timeout for UI smoothness
        addTimeout(() => {
          setIsSubmitting(false);
        }, 600);
        return true;
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erro ao enviar documento");
    }
    
    addTimeout(() => {
      setIsSubmitting(false);
    }, 600);
    return false;
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    // Make sure we're not in an updating state before opening the dialog
    setIsUpdating(false);
    setOpenEditDialog(true);
  };

  const handleUpdateDocument = async (data: { 
    title: string; 
    description?: string;
  }) => {
    if (!selectedDocument) return false;
    
    setIsUpdating(true);
    
    try {
      const result = await updateDocumentMetadata(
        selectedDocument.id, 
        data
      );
      
      if (result) {
        // Update the documents array with the updated document
        setDocuments(prevDocs => prevDocs.map(doc => 
          doc.id === result.id ? result : doc
        ));
        
        // Add a delay to ensure UI smoothness
        addTimeout(() => {
          setIsUpdating(false);
        }, 600);
        
        // Return success after UI is updated
        return true;
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Erro ao atualizar documento");
    }
    
    addTimeout(() => {
      setIsUpdating(false);
    }, 600);
    return false;
  };

  const handleConfirmDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return false;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteDocument(selectedDocument.id, selectedDocument.file_path);
      
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocument.id));
        setOpenDeleteDialog(false);
        
        // Use managed timeout
        addTimeout(() => {
          setIsDeleting(false);
          setSelectedDocument(null);
        }, 600);
        return true;
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao excluir documento");
    }
    
    addTimeout(() => {
      setIsDeleting(false);
    }, 600);
    return false;
  };

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    const toastId = toast.loading("Preparando o download...");
    
    try {
      const url = await getDocumentUrl(document.file_path);
      
      if (url) {
        toast.dismiss(toastId);
        toast.success("Download iniciado");
        
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
    loadDocuments
  };
};
