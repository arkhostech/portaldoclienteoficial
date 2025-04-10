
import { useState, useEffect } from "react";
import { Document, DocumentFormData } from "@/types/document";
import {
  fetchClientDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentDownloadUrl
} from "@/services/documentService";
import { toast } from "sonner";

export const useClientDocuments = (clientId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dialog states
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Load documents when clientId changes
  useEffect(() => {
    if (clientId) {
      loadDocuments();
    }
  }, [clientId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    const result = await fetchClientDocuments(clientId);
    setDocuments(result);
    setIsLoading(false);
  };

  const handleUploadDocument = async (file: File, data: Omit<DocumentFormData, 'client_id'>) => {
    setIsUploading(true);
    try {
      const documentData = {
        ...data,
        client_id: clientId
      };
      
      const newDocument = await uploadDocument(file, documentData);
      
      if (newDocument) {
        setDocuments(prev => [newDocument, ...prev]);
        setOpenUploadDialog(false);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDocument = async (data: Omit<DocumentFormData, 'client_id'>) => {
    if (!selectedDocument) return;
    
    setIsUpdating(true);
    try {
      const updatedDocument = await updateDocument(selectedDocument.id, data);
      
      if (updatedDocument) {
        setDocuments(prev => 
          prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
        );
        setOpenEditDialog(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteDocument(
        selectedDocument.id, 
        selectedDocument.file_path
      );
      
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));
        setOpenDeleteDialog(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    const toastId = toast.loading("Preparando download...");
    
    try {
      const url = await getDocumentDownloadUrl(document.file_path);
      
      toast.dismiss(toastId);
      
      if (url) {
        toast.success("Download iniciado");
        window.open(url, '_blank');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Falha ao iniciar download");
    }
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setOpenEditDialog(true);
  };

  const handleConfirmDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  return {
    // State
    documents,
    selectedDocument,
    isLoading,
    isUploading,
    isUpdating,
    isDeleting,
    
    // Dialog state
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    
    // Dialog actions
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    
    // Document operations
    loadDocuments,
    handleUploadDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleEditDocument,
    handleConfirmDelete,
  };
};
