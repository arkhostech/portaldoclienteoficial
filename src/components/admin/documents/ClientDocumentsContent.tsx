
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search } from "lucide-react";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";
import { Client } from "@/services/clients/types";
import { Document as DocumentType } from "@/services/documents/types";

interface ClientDocumentsContentProps {
  documents: DocumentType[];
  isLoading: boolean;
  isClientLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  client: Client | null;
  clientId: string;
  setOpenUploadDialog: (open: boolean) => void;
  onDownload: (document: DocumentType) => Promise<void>;
  onEdit: (document: DocumentType) => void;
  onDelete: (document: DocumentType) => void;
}

export function ClientDocumentsContent({
  documents,
  isLoading,
  isClientLoading,
  searchTerm,
  setSearchTerm,
  client,
  clientId,
  setOpenUploadDialog,
  onDownload,
  onEdit,
  onDelete
}: ClientDocumentsContentProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading || isClientLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : documents.length > 0 ? (
        <DocumentsTable
          documents={documents}
          isLoading={false}
          searchTerm={searchTerm}
          clients={client ? [client] : []}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          hideClientColumn
        />
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">Nenhum documento disponível</h3>
          <p className="text-muted-foreground">
            Este cliente ainda não possui documentos associados.
          </p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => setOpenUploadDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar documento
          </Button>
        </div>
      )}
    </>
  );
}
