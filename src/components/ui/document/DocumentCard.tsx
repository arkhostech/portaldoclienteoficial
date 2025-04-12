
import { Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClientDocumentView } from "@/services/documents/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getDocumentUrl } from "@/services/documents/documentUrl";
import DocumentPreviewDialog from "./DocumentPreviewDialog";
import { getFileIcon, formatDate, isPreviewable, handleDocumentDownload } from "./DocumentCardUtils";

interface DocumentCardProps {
  document: ClientDocumentView;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    if (!document.filePath) {
      toast.error("Nenhum arquivo disponível para visualização");
      return;
    }

    setIsLoading(true);
    try {
      const url = await getDocumentUrl(document.filePath);
      if (url) {
        setPreviewUrl(url);
        setPreviewOpen(true);
      } else {
        toast.error("Erro ao acessar o documento");
      }
    } catch (error) {
      console.error("Error getting document URL:", error);
      toast.error("Erro ao acessar o documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    handleDocumentDownload(document.filePath, document.name);
  };

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {getFileIcon(document.type)}
            
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
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs py-1 px-2 h-auto" 
                onClick={handleDownload}
                disabled={isLoading}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>

              {isPreviewable(document.type) ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs py-1 px-2 h-auto" 
                  onClick={handlePreview}
                  disabled={isLoading}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Visualizar
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs py-1 px-2 h-auto" 
                  disabled={true}
                  title="Visualização não disponível para este tipo de arquivo"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Visualizar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DocumentPreviewDialog 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        documentUrl={previewUrl}
        document={document}
      />
    </>
  );
};

export default DocumentCard;
