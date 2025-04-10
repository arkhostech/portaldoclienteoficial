
import { useState, useEffect } from "react";
import { Document, fetchClientDocuments } from "@/services/documents";

export const useDocumentsState = (clientId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Load client documents when clientId changes
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

  return {
    documents,
    setDocuments,
    isLoading,
    selectedDocument,
    setSelectedDocument,
    loadClientDocuments
  };
};
