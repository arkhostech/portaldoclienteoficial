import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, List, Grid3X3, Download, Trash2, Clock } from "lucide-react";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";
import { Client } from "@/services/clients/types";
import { Document as DocumentType } from "@/services/documents/types";
import { useState } from "react";

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'grid' : 'list');
  };

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
        <div className="flex items-center gap-2">
          <div className="flex bg-[#f8fafc] rounded-lg p-1 border border-[#e5e7eb]">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleViewMode}
              className={`px-3 py-1 h-8 transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-[#053D38] text-white shadow-sm' 
                  : 'text-[#34675C] hover:text-[#053D38] hover:bg-[#F5F1EB]'
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleViewMode}
              className={`px-3 py-1 h-8 transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-[#053D38] text-white shadow-sm' 
                  : 'text-[#34675C] hover:text-[#053D38] hover:bg-[#F5F1EB]'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
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
        viewMode === 'list' ? (
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
          <DocumentsGrid
            documents={documents}
            searchTerm={searchTerm}
            onDownload={onDownload}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
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

// Componente DocumentsGrid
function DocumentsGrid({
  documents,
  searchTerm,
  onDownload,
  onEdit,
  onDelete
}: {
  documents: DocumentType[];
  searchTerm: string;
  onDownload: (document: DocumentType) => Promise<void>;
  onEdit: (document: DocumentType) => void;
  onDelete: (document: DocumentType) => void;
}) {
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Function to highlight matched text
  const highlightMatch = (text: string, term: string) => {
    if (!term || term === "") return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded-sm">{part}</mark> : part
    );
  };

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-[#34675C] bg-[#fafbfc] rounded-lg border border-[#e5e7eb]">
        <FileText className="h-8 w-8 mx-auto mb-2 text-[#34675C]" />
        <p className="font-medium">
          {searchTerm
            ? "Nenhum documento encontrado para a busca."
            : "Nenhum documento cadastrado."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDocuments.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border border-[#e5e7eb] rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
          onClick={() => onEdit(doc)}
        >
          <div className="flex items-start justify-between mb-3">
            <FileText className="h-8 w-8 text-[#053D38] flex-shrink-0" />
            <div className="flex gap-1">
              {doc.file_path && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#34675C] hover:text-[#053D38] hover:bg-[#F5F1EB] transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDownload(doc);
                  }}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#F26800] hover:text-[#e55d00] hover:bg-[#FFF3E0] transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(doc);
                }}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h3 className="font-medium text-[#14140F] mb-2 line-clamp-2" style={{ fontWeight: 500 }}>
            {searchTerm ? highlightMatch(doc.title, searchTerm) : doc.title}
          </h3>
          
          <div className="flex items-center mb-2">
            <span className={`px-2 py-1 rounded-xl text-xs font-medium ${
              doc.uploaded_by === 'client' 
                ? 'bg-[#A3CCAB] text-[#14140F]' 
                : 'bg-[#053D38] text-white'
            }`} style={{ borderRadius: '12px', padding: '4px 8px', fontSize: '12px' }}>
              {doc.uploaded_by === 'client' ? 'Cliente' : 'Admin'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-[#34675C]">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDate(doc.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
