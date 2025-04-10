
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (clientId) {
      loadClientDocuments();
    }
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
        // Delay closing the dialog to prevent UI issues
        setTimeout(() => {
          setOpenUploadDialog(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
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
        setDocuments(prevDocs => prevDocs.map(doc => doc.id === result.id ? result : doc));
        // Delay closing the dialog to prevent UI issues
        setTimeout(() => {
          setOpenEditDialog(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Erro ao atualizar documento");
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 300);
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
        // Delay closing the dialog to prevent UI issues
        setTimeout(() => {
          setOpenDeleteDialog(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao excluir documento");
    } finally {
      setTimeout(() => {
        setIsDeleting(false);
      }, 300);
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

  // Dialog control helpers
  const handleUploadDialogChange = (open: boolean) => {
    if (!isSubmitting) {
      setOpenUploadDialog(open);
    } else if (open) {
      setOpenUploadDialog(open);
    }
  };
  
  const handleEditDialogChange = (open: boolean) => {
    if (!isUpdating) {
      setOpenEditDialog(open);
    } else if (open) {
      setOpenEditDialog(open);
    }
  };
  
  const handleDeleteDialogChange = (open: boolean) => {
    if (!isDeleting) {
      setOpenDeleteDialog(open);
    } else if (open) {
      setOpenDeleteDialog(open);
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
    setOpenUploadDialog: handleUploadDialogChange,
    setOpenEditDialog: handleEditDialogChange,
    setOpenDeleteDialog: handleDeleteDialogChange,
    handleUploadDocument,
    handleEditDocument,
    handleUpdateDocument,
    handleConfirmDelete,
    handleDeleteDocument,
    handleDownloadDocument,
  };
};
