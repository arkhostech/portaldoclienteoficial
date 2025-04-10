
import { useState, useEffect } from "react";
import { Document, fetchDocuments } from "@/services/documents"; // Fixed import to use fetchDocuments

export const useDocumentsState = (clientId: string | null) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Load client documents when clientId changes
  useEffect(() => {
    if (clientId) {
      loadClientDocuments();
    } else {
      loadAllDocuments();
    }
  }, [clientId]);

  const loadClientDocuments = async () => {
    setIsLoading(true);
    const documentsData = await fetchDocuments(clientId);
    setDocuments(documentsData);
    setIsLoading(false);
  };
  
  const loadAllDocuments = async () => {
    setIsLoading(true);
    const documentsData = await fetchDocuments();
    setDocuments(documentsData);
    setIsLoading(false);
  };

  return {
    documents,
    setDocuments,
    isLoading,
    selectedDocument,
    setSelectedDocument,
    loadClientDocuments,
    loadAllDocuments
  };
};
