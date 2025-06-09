
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDocuments } from "@/hooks/documents/useDocuments";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { Document as DocumentType } from "@/services/documents/types";
import { Input } from "@/components/ui/input";
import { Search, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientDocuments from "@/components/ui/document/ClientDocuments";
import { highlightMatch } from "@/components/admin/documents/DocumentsUtils";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { clients, isLoading: isClientsLoading } = useClients();
  const navigate = useNavigate();
  
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
  } = useDocuments(selectedClientId);

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

  const getClientProcessType = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.process_type || undefined;
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/admin/documents/${clientId}`);
  };

  // Get all client IDs (including those without documents)
  const allClientIds = clients.map(client => client.id);

  // Filter clients and documents based on search term
  const filteredClientIds = allClientIds.filter(clientId => {
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

  // Sort clients: first those with documents (by latest document date), then empty ones (by client creation date)
  const sortedClientIds = filteredClientIds.sort((a, b) => {
    const docsA = groupedDocuments[a] || [];
    const docsB = groupedDocuments[b] || [];
    
    const hasDocsA = docsA.length > 0;
    const hasDocsB = docsB.length > 0;
    
    // If one has documents and other doesn't, prioritize the one with documents
    if (hasDocsA && !hasDocsB) return -1;
    if (!hasDocsA && hasDocsB) return 1;
    
    // If both have documents, sort by latest document date (newest first)
    if (hasDocsA && hasDocsB) {
      const latestDateA = Math.max(...docsA.map(doc => new Date(doc.created_at).getTime()));
      const latestDateB = Math.max(...docsB.map(doc => new Date(doc.created_at).getTime()));
      return latestDateB - latestDateA; // Newest first
    }
    
    // If both are empty, sort by client creation date (newest first)
    const clientA = clients.find(c => c.id === a);
    const clientB = clients.find(c => c.id === b);
    
    if (clientA && clientB) {
      const dateA = new Date(clientA.created_at).getTime();
      const dateB = new Date(clientB.created_at).getTime();
      return dateB - dateA; // Newest first
    }
    
    // Fallback to alphabetical if no dates available
    const nameA = getClientName(a).toLowerCase();
    const nameB = getClientName(b).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <MainLayout title="Documentos">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground">
              Gerencie os documentos dos clientes.
            </p>
          </div>
          <div>
            <Button 
              onClick={() => setOpenUploadDialog(true)}
              className="w-full md:w-auto"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por cliente ou documento..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || isClientsLoading ? (
              <div className="space-y-3">
                <div className="h-12 bg-muted animate-pulse rounded-md" />
                <div className="h-12 bg-muted animate-pulse rounded-md" />
                <div className="h-12 bg-muted animate-pulse rounded-md" />
              </div>
            ) : sortedClientIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedClientIds.map(clientId => (
                  <ClientDocuments
                    key={clientId}
                    clientName={getClientName(clientId)}
                    processType={getClientProcessType(clientId)}
                    documents={groupedDocuments[clientId] || []}
                    onClick={() => handleClientClick(clientId)}
                    highlightMatch={highlightMatch}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FilePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 
                    "Não foram encontrados clientes correspondentes à sua pesquisa." : 
                    "Cadastre clientes primeiro para gerenciar seus documentos."
                  }
                </p>
              </div>
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
