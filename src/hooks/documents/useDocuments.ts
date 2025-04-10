
import { useEffect } from "react";
import { useDocumentsState } from "./useDocumentsState";
import { useDocumentOperations } from "./useDocumentOperations";
import { useDocumentDialogs } from "./useDocumentDialogs";

export const useDocuments = (clientId: string | null = null) => {
  const {
    documents,
    setDocuments,
    isLoading,
    selectedDocument,
    setSelectedDocument,
    loadClientDocuments,
    loadAllDocuments
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

  const loadDocuments = clientId ? loadClientDocuments : loadAllDocuments;

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
