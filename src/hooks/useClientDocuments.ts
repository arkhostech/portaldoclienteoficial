
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
  
  // UI state management refs
  const pendingOperationRef = useRef<NodeJS.Timeout | null>(null);
  const operationCompletedRef = useRef(false);

  useEffect(() => {
    if (clientId) {
      loadClientDocuments();
    }
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (pendingOperationRef.current) {
        clearTimeout(pendingOperationRef.current);
        pendingOperationRef.current = null;
      }
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
    operationCompletedRef.current = false;
    
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
        operationCompletedRef.current = true;
        
        // Delay closing the dialog to prevent UI issues
        pendingOperationRef.current = setTimeout(() => {
          setOpenUploadDialog(false);
          pendingOperationRef.current = null;
        }, 500);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      // Ensure we reset the submitting state after some delay
      pendingOperationRef.current = setTimeout(() => {
        setIsSubmitting(false);
        pendingOperationRef.current = null;
      }, 500);
    }
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setOpenEditDialog(true);
  };

  const handleUpdateDocument = async (data: Omit<DocumentFormData, 'client_id'>) => {
    if (!selectedDocument) return;
    
    setIsUpdating(true);
    operationCompletedRef.current = false;
    
    try {
      const result = await updateDocumentMetadata(selectedDocument.id, data);
      
      if (result) {
        setDocuments(prevDocs => prevDocs.map(doc => doc.id === result.id ? result : doc));
        operationCompletedRef.current = true;
        
        // Delay closing the dialog to prevent UI issues
        pendingOperationRef.current = setTimeout(() => {
          setOpenEditDialog(false);
          pendingOperationRef.current = null;
        }, 600); // Slightly longer delay for status changes
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Erro ao atualizar documento");
    } finally {
      // Ensure we reset the updating state after some delay
      pendingOperationRef.current = setTimeout(() => {
        setIsUpdating(false);
        pendingOperationRef.current = null;
      }, 600); // Slightly longer delay for status changes
    }
  };

  const handleConfirmDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    operationCompletedRef.current = false;
    
    try {
      const success = await deleteDocument(selectedDocument.id, selectedDocument.file_path);
      
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocument.id));
        operationCompletedRef.current = true;
        
        // Delay closing the dialog to prevent UI issues
        pendingOperationRef.current = setTimeout(() => {
          setOpenDeleteDialog(false);
          pendingOperationRef.current = null;
        }, 500);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao excluir documento");
    } finally {
      pendingOperationRef.current = setTimeout(() => {
        setIsDeleting(false);
        pendingOperationRef.current = null;
      }, 500);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    const url = await getDocumentUrl(document.file_path);
    
    if (url) {
      // Open in a new tab to avoid navigation issues
      const win = window.open(url, '_blank');
      if (win) win.focus();
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
