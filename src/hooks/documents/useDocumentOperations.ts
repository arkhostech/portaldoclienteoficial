
import { useEffect } from "react";
import { Document } from "@/services/documents";
import { useDocumentUpload } from "./operations/useDocumentUpload";
import { useDocumentUpdate } from "./operations/useDocumentUpdate";
import { useDocumentDelete } from "./operations/useDocumentDelete";
import { useDocumentDownload } from "./operations/useDocumentDownload";
import { useTimeoutManager } from "./utils/useTimeoutManager";

export const useDocumentOperations = (
  clientId: string | null,
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  selectedDocument: Document | null
) => {
  const { clearAllTimeouts } = useTimeoutManager();
  
  const { isSubmitting, handleUploadDocument } = useDocumentUpload(clientId, setDocuments);
  const { isUpdating, handleUpdateDocument } = useDocumentUpdate(setDocuments, selectedDocument);
  const { isDeleting, handleDeleteDocument } = useDocumentDelete(setDocuments, selectedDocument);
  const { handleDownloadDocument } = useDocumentDownload();

  // Cleanup function for when the component unmounts
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

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
