import { Folder, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Document } from "@/services/documents";

interface ClientDocumentsProps {
  clientName: string;
  processType?: string;
  documents: Document[];
  onClick: () => void;
  highlightMatch?: (text: string, term: string) => React.ReactNode;
  searchTerm?: string;
}

const ClientDocuments = ({ 
  clientName,
  processType,
  documents, 
  onClick,
  highlightMatch,
  searchTerm = ""
}: ClientDocumentsProps) => {
  const latestDate = documents.length > 0 
    ? formatDate(new Date(Math.max(...documents.map(doc => new Date(doc.created_at).getTime()))).toISOString())
    : null;

  const isEmpty = documents.length === 0;
  
  return (
    <Card 
      className="w-full hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-0 shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Folder Icon Section */}
        <div className={`p-6 rounded-t-lg flex flex-col items-center justify-center relative min-h-[140px] ${
          isEmpty 
            ? "bg-gradient-to-br from-gray-400 to-gray-500" 
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        }`}>
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/20 text-white border-white/30 text-xs font-medium"
          >
            {documents.length}
          </Badge>
          
          <Folder 
            className="h-12 w-12 text-white drop-shadow-lg" 
            fill="currentColor" 
            strokeWidth={1}
          />
          
          {isEmpty && (
            <div className="mt-1 text-center">
              <p className="text-white/80 text-xs font-medium">Pasta vazia</p>
            </div>
          )}
        </div>

        {/* Client Info Section */}
        <div className="p-3 bg-white rounded-b-lg">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {highlightMatch 
              ? highlightMatch(clientName, searchTerm)
              : clientName
            }
          </h3>
          
          {processType && (
            <p className="text-sm text-gray-600 mb-2">
              {processType}
            </p>
          )}
          
          {isEmpty ? (
            <div className="text-xs text-gray-500 italic">
              Nenhum documento ainda
            </div>
          ) : (
            latestDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Criado em {latestDate}</span>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDocuments;
