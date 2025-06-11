import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, Download, FileText, Loader2, Pencil, Trash2, User } from "lucide-react";
import { Document as DocumentType } from "@/services/documents/types";

interface Client {
  id: string;
  full_name: string;
  email: string;
}

interface DocumentsTableProps {
  documents: DocumentType[];
  isLoading: boolean;
  searchTerm: string;
  clients: Client[];
  onDownload: (document: DocumentType) => void;
  onEdit: (document: DocumentType) => void;
  onDelete: (document: DocumentType) => void;
  hideClientColumn?: boolean;
}

export default function DocumentsTable({
  documents,
  isLoading,
  searchTerm,
  clients,
  onDownload,
  onEdit,
  onDelete,
  hideClientColumn = false
}: DocumentsTableProps) {
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
  
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.full_name : "Cliente não encontrado";
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

  const handleCellClick = (document: DocumentType) => {
    onEdit(document);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#053D38]" />
      </div>
    );
  }
  
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
    <Table>
      <TableHeader>
        <TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
          <TableHead className="text-[#14140F] font-semibold" style={{ fontWeight: 600 }}>Título</TableHead>
          {!hideClientColumn && <TableHead className="text-[#14140F] font-semibold" style={{ fontWeight: 600 }}>Cliente</TableHead>}
          <TableHead className="text-[#14140F] font-semibold" style={{ fontWeight: 600 }}>Enviado por</TableHead>
          <TableHead className="text-[#14140F] font-semibold" style={{ fontWeight: 600 }}>Data</TableHead>
          <TableHead className="text-right text-[#14140F] font-semibold" style={{ fontWeight: 600 }}>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredDocuments.map((doc, index) => (
          <TableRow 
            key={doc.id} 
            className={`cursor-pointer border-b border-[#e5e7eb] transition-colors duration-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
            } hover:bg-[#A3CCAB] hover:bg-opacity-10`}
          >
            <TableCell 
              className="font-medium transition-colors duration-200"
              style={{ fontWeight: 500 }}
              onClick={() => handleCellClick(doc)}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-[#053D38]" />
                <span className="truncate max-w-[200px] text-[#14140F]" title={doc.title}>
                  {searchTerm ? highlightMatch(doc.title, searchTerm) : doc.title}
                </span>
                <Pencil className="h-3 w-3 ml-2 text-[#34675C] opacity-50" />
              </div>
            </TableCell>
            {!hideClientColumn && (
              <TableCell 
                className="transition-colors duration-200"
                onClick={() => handleCellClick(doc)}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 flex-shrink-0 text-[#053D38]" />
                  <span className="truncate max-w-[150px]">
                    {searchTerm ? highlightMatch(getClientName(doc.client_id), searchTerm) : getClientName(doc.client_id)}
                  </span>
                  <Pencil className="h-3 w-3 ml-2 text-[#34675C] opacity-50" />
                </div>
              </TableCell>
            )}
            <TableCell>
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1 text-[#34675C]" />
                <span className={`px-2 py-1 rounded-xl text-xs font-medium ${
                  doc.uploaded_by === 'client' 
                    ? 'bg-[#A3CCAB] text-[#14140F]' 
                    : 'bg-[#053D38] text-white'
                }`} style={{ borderRadius: '12px', padding: '4px 8px', fontSize: '12px' }}>
                  {doc.uploaded_by === 'client' ? 'Cliente' : 'Admin'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-[#34675C]" />
                <span className="text-[#34675C] text-sm">{formatDate(doc.created_at)}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {doc.file_path && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-[#34675C] hover:text-[#053D38] hover:bg-[#F5F1EB] transition-all duration-200 hover:scale-105"
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
                  className="text-[#F26800] hover:text-[#e55d00] hover:bg-[#FFF3E0] transition-all duration-200 hover:scale-105"
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
