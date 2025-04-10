
import { useEffect } from "react";
import { useDocumentsState } from "./useDocumentsState";
import { useDocumentOperations } from "./useDocumentOperations";
import { useDocumentDialogs } from "./useDocumentDialogs";
import { Document } from "@/services/documents";

export const useClientDocuments = (clientId: string) => {
  const {
    documents,
    setDocuments,
    isLoading,
    selectedDocument,
    setSelectedDocument
  } = useDocumentsState(clientId);

  const {
    isSubmitting,
    isUpdating,
    isDeleting,
    handleUploadDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    clearAllTimeouts
  } = useDocumentOperations(clientId, documents, setDocuments, selectedDocument);

  const {
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    handleEditDocument,
    handleConfirmDelete
  } = useDocumentDialogs(setSelectedDocument);

  // Cleanup function for when the component unmounts
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  return {
    // Document state
    documents,
    isLoading,
    selectedDocument,
    
    // Dialog state
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    
    // Operation state
    isSubmitting,
    isUpdating,
    isDeleting,
    
    // Dialog actions
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    
    // Document operations
    handleUploadDocument,
    handleEditDocument,
    handleUpdateDocument,
    handleConfirmDelete,
    handleDeleteDocument,
    handleDownloadDocument,
  };
};
