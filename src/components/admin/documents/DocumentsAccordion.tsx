
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Document as DocumentType } from "@/services/documents/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";

interface DocumentsAccordionProps {
  sortedClientIds: string[];
  expandedItems: string[];
  getClientName: (clientId: string) => string;
  groupedDocuments: Record<string, DocumentType[]>;
  searchTerm: string;
  clients: any[];
  handleOpenUploadForClient: (clientId: string) => void;
  handleDirectDownload: (document: DocumentType) => Promise<void>;
  handleDirectEdit: (document: DocumentType) => void;
  handleDirectDelete: (document: DocumentType) => void;
  highlightMatch: (text: string, term: string) => React.ReactNode;
}

export function DocumentsAccordion({
  sortedClientIds,
  expandedItems,
  getClientName,
  groupedDocuments,
  searchTerm,
  clients,
  handleOpenUploadForClient,
  handleDirectDownload,
  handleDirectEdit,
  handleDirectDelete,
  highlightMatch
}: DocumentsAccordionProps) {
  return (
    <Accordion 
      type="multiple" 
      value={expandedItems} 
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
  );
}
