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
        <div 
          className="p-6 rounded-t-lg flex flex-col items-center justify-center relative min-h-[140px]"
          style={{
            background: isEmpty 
              ? 'linear-gradient(135deg, #14140F 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #053D38 0%, #34675C 100%)'
          }}
        >
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 text-xs font-medium text-white border-none"
            style={{
              backgroundColor: isEmpty ? 'rgba(0,0,0,0.3)' : '#34675C'
            }}
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
              <p 
                className="text-xs font-medium"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Pasta vazia
              </p>
            </div>
          )}
        </div>

        {/* Client Info Section */}
        <div 
          className="p-3 rounded-b-lg"
          style={{
            background: isEmpty 
              ? '#ffffff'
              : 'linear-gradient(135deg, #053D38 0%, #34675C 100%)'
          }}
        >
          <h3 
            className="font-semibold text-sm mb-1 truncate"
            style={{ color: isEmpty ? '#6b7280' : 'rgba(255,255,255,0.8)' }}
          >
            {highlightMatch 
              ? highlightMatch(clientName, searchTerm)
              : clientName
            }
          </h3>
          
          {processType && (
            <p 
              className="text-sm mb-2"
              style={{ color: isEmpty ? '#9ca3af' : 'rgba(255,255,255,0.8)' }}
            >
              {processType}
            </p>
          )}
          
          {isEmpty ? (
            <div 
              className="text-xs italic"
              style={{ color: '#9ca3af' }}
            >
              Nenhum documento ainda
            </div>
          ) : (
            latestDate && (
              <div 
                className="flex items-center gap-1 text-xs"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
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
