
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchTerm
          ? "Nenhum documento encontrado para a busca."
          : "Nenhum documento cadastrado."
        }
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          {!hideClientColumn && <TableHead>Cliente</TableHead>}
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredDocuments.map(doc => (
          <TableRow key={doc.id} className="cursor-pointer">
            <TableCell 
              className="font-medium hover:bg-muted/50"
              onClick={() => handleCellClick(doc)}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate max-w-[200px]" title={doc.title}>
                  {searchTerm ? highlightMatch(doc.title, searchTerm) : doc.title}
                </span>
                <Pencil className="h-3 w-3 ml-2 text-muted-foreground opacity-50" />
              </div>
            </TableCell>
            {!hideClientColumn && (
              <TableCell 
                className="hover:bg-muted/50"
                onClick={() => handleCellClick(doc)}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {searchTerm ? highlightMatch(getClientName(doc.client_id), searchTerm) : getClientName(doc.client_id)}
                  </span>
                  <Pencil className="h-3 w-3 ml-2 text-muted-foreground opacity-50" />
                </div>
              </TableCell>
            )}
            <TableCell>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                {formatDate(doc.created_at)}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {doc.file_path && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
