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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#34675C]" />
            <Input
              type="search"
              placeholder="Buscar documentos..."
              className="pl-8 border-[#e5e7eb] focus:border-[#053D38] focus:ring-[#053D38] rounded-lg transition-colors duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button 
            className="w-full md:w-auto bg-[#053D38] hover:bg-[#34675C] text-white transition-colors duration-200 rounded-lg shadow-md hover:shadow-lg" 
            onClick={() => setOpenUploadDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4 text-white" /> 
            Adicionar documento
          </Button>
        </div>
      </div>

      {isLoading || isClientLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#053D38] border-t-transparent"></div>
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
        <div className="text-center py-12 border border-[#e5e7eb] rounded-lg bg-[#fafbfc]">
          <FileText className="h-12 w-12 text-[#34675C] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1 text-[#14140F]" style={{ fontWeight: 500 }}>Nenhum documento disponível</h3>
          <p className="text-[#34675C] mb-4">
            Este cliente ainda não possui documentos associados.
          </p>
          <p className="text-sm text-[#34675C] px-4 py-2 bg-[#F5F1EB] rounded-lg inline-block">
            💡 Use o botão "Adicionar documento" acima para começar.
          </p>
        </div>
      )}
    </>
  );
}
