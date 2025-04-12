
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDocuments } from "@/hooks/documents/useDocuments";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { Document as DocumentType } from "@/services/documents/types";
import { DocumentsHeader } from "@/components/admin/documents/DocumentsHeader";
import { DocumentsSearch } from "@/components/admin/documents/DocumentsSearch";
import { DocumentsAccordion } from "@/components/admin/documents/DocumentsAccordion";
import { DocumentsAccordionHeader } from "@/components/admin/documents/DocumentsAccordionHeader";
import { DocumentsLoading } from "@/components/admin/documents/DocumentsLoading";
import { DocumentsEmpty } from "@/components/admin/documents/DocumentsEmpty";
import { highlightMatch } from "@/components/admin/documents/DocumentsUtils";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { clients, isLoading: isClientsLoading } = useClients();
  
  const {
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
    loadDocuments,
  } = useDocuments(selectedClientId);

  // Function to handle document edit directly from the table
  const handleDirectEdit = (document: DocumentType) => {
    handleEditDocument(document);
  };

  // Function to handle document deletion directly from the table
  const handleDirectDelete = (document: DocumentType) => {
    handleConfirmDelete(document);
  };

  // Function to handle document download directly from the table
  const handleDirectDownload = async (document: DocumentType) => {
    try {
      await handleDownloadDocument(document);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Erro ao baixar o documento");
    }
  };

  // Group documents by client
  const groupedDocuments = documents.reduce((acc, document) => {
    if (!acc[document.client_id]) {
      acc[document.client_id] = [];
    }
    acc[document.client_id].push(document);
    return acc;
  }, {} as Record<string, DocumentType[]>);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.full_name || "Cliente desconhecido";
  };

  // Filter clients and documents based on search term
  const filteredClientIds = Object.keys(groupedDocuments).filter(clientId => {
    const clientName = getClientName(clientId).toLowerCase();
    const clientDocs = groupedDocuments[clientId] || [];
    
    // Check if search term matches client name
    const matchesClientName = clientName.includes(searchTerm.toLowerCase());
    
    // Check if any document title or description matches search term
    const hasMatchingDocs = clientDocs.some(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return searchTerm === "" || matchesClientName || hasMatchingDocs;
  });

  // Sort clients alphabetically by name
  const sortedClientIds = filteredClientIds.sort((a, b) => {
    const nameA = getClientName(a).toLowerCase();
    const nameB = getClientName(b).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Toggle all accordions
  const toggleAllAccordions = () => {
    if (expandedItems.length === sortedClientIds.length) {
      setExpandedItems([]);
    } else {
      setExpandedItems([...sortedClientIds]);
    }
  };

  // Handle accordion value change
  const handleAccordionChange = (value: string[]) => {
    setExpandedItems(value);
  };

  // Open upload dialog with preselected client
  const handleOpenUploadForClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setOpenUploadDialog(true);
  };

  return (
    <MainLayout title="Documentos">
      <div className="container mx-auto py-6 space-y-6">
        <DocumentsHeader onAddDocument={() => setOpenUploadDialog(true)} />

        <Card>
          <CardHeader>
            <DocumentsAccordionHeader 
              toggleAllAccordions={toggleAllAccordions}
              expandedItems={expandedItems}
              sortedClientIds={sortedClientIds}
            />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <DocumentsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            {isLoading || isClientsLoading ? (
              <DocumentsLoading />
            ) : sortedClientIds.length > 0 ? (
              <DocumentsAccordion 
                sortedClientIds={sortedClientIds}
                expandedItems={expandedItems}
                getClientName={getClientName}
                groupedDocuments={groupedDocuments}
                searchTerm={searchTerm}
                clients={clients}
                handleOpenUploadForClient={handleOpenUploadForClient}
                handleDirectDownload={handleDirectDownload}
                handleDirectEdit={handleDirectEdit}
                handleDirectDelete={handleDirectDelete}
                highlightMatch={highlightMatch}
              />
            ) : (
              <DocumentsEmpty searchTerm={searchTerm} />
            )}
          </CardContent>
        </Card>
      </div>
      
      <DocumentUploadDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        onUpload={handleUploadDocument}
        isSubmitting={isSubmitting}
        clients={clients}
        preSelectedClientId={selectedClientId}
      />
      
      <DocumentEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        document={selectedDocument}
        onSave={handleUpdateDocument}
        isUpdating={isUpdating}
      />
      
      <DocumentDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        document={selectedDocument}
        onDelete={handleDeleteDocument}
        isDeleting={isDeleting}
      />
    </MainLayout>
  );
}
