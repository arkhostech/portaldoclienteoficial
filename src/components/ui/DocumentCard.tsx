
import { File, FileText, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Document } from "@/utils/dummyData";
import { Button } from "@/components/ui/button";

interface DocumentCardProps {
  document: Document;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const getFileIcon = () => {
    switch (document.type) {
      case "PDF":
        return <FileText className="h-10 w-10 text-red-500" />;
      case "JPG":
      case "PNG":
        return <Image className="h-10 w-10 text-blue-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {getFileIcon()}
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{document.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {document.category}
              </Badge>
              
              {document.needsSignature && (
                <Badge variant={document.signed ? "outline" : "destructive"} className="text-xs">
                  {document.signed ? "Assinado" : "Requer Assinatura"}
                </Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>{formatDate(document.uploadDate)}</span>
              <span>{document.size}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Enviado por: {document.uploadedBy}
          </span>
          
          <div className="flex space-x-2">
            {document.needsSignature && !document.signed && (
              <Button size="sm" className="text-xs py-1 px-2 h-auto">
                Assinar
              </Button>
            )}
            
            <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto">
              Visualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
