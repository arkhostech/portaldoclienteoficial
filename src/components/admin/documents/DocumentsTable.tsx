
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  FileText, 
  Clock, 
  Download, 
  Pencil, 
  Trash2,
  Loader2 
} from "lucide-react";
import { Document } from "@/services/documentService";

interface DocumentsTableProps {
  documents: Document[];
  isLoading: boolean;
  searchTerm: string;
  onDownload: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const DocumentsTable = ({
  documents,
  isLoading,
  searchTerm,
  onDownload,
  onEdit,
  onDelete
}: DocumentsTableProps) => {
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

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
        {searchTerm ? "Nenhum documento encontrado para a busca." : "Nenhum documento cadastrado."}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Tamanho</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredDocuments.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate max-w-[200px]" title={doc.title}>
                  {doc.title}
                </span>
              </div>
            </TableCell>
            <TableCell>{doc.file_type || "N/A"}</TableCell>
            <TableCell>{formatFileSize(doc.file_size)}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                {formatDate(doc.created_at)}
              </div>
            </TableCell>
            <TableCell>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                doc.status === "active" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-700"
              }`}>
                {doc.status === "active" ? "Ativo" : "Inativo"}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {doc.file_path && (
                    <DropdownMenuItem onClick={() => onDownload(doc)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(doc)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(doc)} 
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DocumentsTable;
