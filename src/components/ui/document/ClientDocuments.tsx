
import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Document } from "@/services/documents";

interface ClientDocumentsProps {
  clientName: string;
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  onDownload: (document: Document) => void;
  highlightMatch?: (text: string, term: string) => React.ReactNode;
  searchTerm?: string;
}

const ClientDocuments = ({ 
  clientName, 
  documents, 
  onEdit, 
  onDelete, 
  onDownload,
  highlightMatch,
  searchTerm = ""
}: ClientDocumentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border rounded-md mb-2 overflow-hidden">
      <div
        className="flex justify-between items-center px-4 py-2 bg-muted cursor-pointer hover:bg-muted/80 transition"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2 font-medium">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>
            {highlightMatch 
              ? highlightMatch(clientName, searchTerm)
              : clientName
            }
          </span>
          <span className="text-muted-foreground text-sm">({documents.length} documento{documents.length !== 1 ? "s" : ""})</span>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 py-2 bg-white">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center py-2 border-b last:border-none">
                <div>
                  <p className="text-sm font-medium">
                    {highlightMatch 
                      ? highlightMatch(doc.title, searchTerm)
                      : doc.title
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em: {formatDate(doc.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    onEdit(doc);
                  }} title="Editar">
                    <Pencil size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    onDownload(doc);
                  }} title="Download">
                    <Download size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive" onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc);
                  }} title="Excluir">
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Nenhum documento encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;
