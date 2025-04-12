
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";
import { useDocuments } from "@/hooks/documents/useDocuments";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { useClients } from "@/hooks/useClients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Document as DocumentType } from "@/services/documents/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";

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

  // Function to highlight matched text in a string
  const highlightMatch = (text: string, term: string) => {
    if (!term || term === "") return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded-sm">{part}</mark> : part
    );
  };

  return (
    <MainLayout title="Documentos">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Documentos</h1>
          <Button onClick={() => setOpenUploadDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar documento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gerenciar documentos</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAllAccordions}
              >
                {expandedItems.length === sortedClientIds.length ? "Recolher todos" : "Expandir todos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por cliente ou documento..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {isLoading || isClientsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : sortedClientIds.length > 0 ? (
              <Accordion 
                type="multiple" 
                value={expandedItems} 
                onValueChange={handleAccordionChange}
                className="space-y-2"
              >
                {sortedClientIds.map(clientId => {
                  const clientDocs = groupedDocuments[clientId] || [];
                  const filteredDocs = searchTerm 
                    ? clientDocs.filter(doc => 
                        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                    : clientDocs;
                  
                  // Skip if no documents match the search (but include if client name matches)
                  const clientName = getClientName(clientId).toLowerCase();
                  const clientMatchesSearch = clientName.includes(searchTerm.toLowerCase());
                  
                  if (searchTerm && filteredDocs.length === 0 && !clientMatchesSearch) {
                    return null;
                  }
                  
                  return (
                    <AccordionItem 
                      key={clientId} 
                      value={clientId}
                      className="border rounded-lg overflow-hidden bg-white"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center justify-between w-full text-left">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {searchTerm && clientName.includes(searchTerm.toLowerCase())
                                ? highlightMatch(getClientName(clientId), searchTerm)
                                : getClientName(clientId)}
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({clientDocs.length} {clientDocs.length === 1 ? 'documento' : 'documentos'})
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-0">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm text-muted-foreground">
                            {filteredDocs.length} {filteredDocs.length === 1 ? 'documento' : 'documentos'} {searchTerm && 'encontrados'}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleOpenUploadForClient(clientId)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                          </Button>
                        </div>
                        
                        <DocumentsTable 
                          documents={filteredDocs}
                          isLoading={false}
                          searchTerm={searchTerm}
                          clients={clients}
                          onDownload={handleDirectDownload}
                          onEdit={handleDirectEdit}
                          onDelete={handleDirectDelete}
                          hideClientColumn={true}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum documento encontrado.</p>
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
