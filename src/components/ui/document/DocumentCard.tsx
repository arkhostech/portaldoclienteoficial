import { Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClientDocumentView } from "@/services/documents/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getDocumentUrl } from "@/services/documents/documentUrl";
import DocumentPreviewDialog from "./DocumentPreviewDialog";
import { getFileIcon, formatDate, isPreviewable } from "./DocumentCardUtils";
import { useDocumentDownload } from "@/hooks/documents/operations/useDocumentDownload";

interface DocumentCardProps {
  document: ClientDocumentView;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleDownloadDocument } = useDocumentDownload();

  const handlePreview = async () => {
    if (!document.filePath) {
      toast.error("Nenhum arquivo disponível para visualização");
      console.error("Document has no filePath:", document);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Carregando documento...");
    
    try {
      console.log("Requesting signed URL for file:", document.filePath);
      console.log("Document details:", {
        id: document.id,
        name: document.name,
        type: document.type
      });
      
      const url = await getDocumentUrl(document.filePath);
      
      if (url) {
        console.log("Successfully obtained signed URL for preview");
        toast.dismiss(toastId);
        setPreviewUrl(url);
        setPreviewOpen(true);
      } else {
        toast.dismiss(toastId);
        toast.error("Erro ao acessar o documento");
        console.error("Failed to get document URL for preview:", {
          documentId: document.id,
          filePath: document.filePath,
          documentType: document.type
        });
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error getting document URL:", error);
      toast.error("Erro ao acessar o documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    handleDownloadDocument({ filePath: document.filePath, fileName: document.name });
  };

  const canPreview = isPreviewable(document.type);

  return (
    <>
      <Card className="group overflow-hidden bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#dbeafe] rounded-lg group-hover:bg-[#93c5fd] transition-colors duration-300">
              {getFileIcon(document.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#000000] truncate mb-2 group-hover:text-[#1e3a8a] transition-colors duration-300">
                {document.name}
              </h4>
              
              <div className="flex items-center space-x-2 mb-3">
                <Badge 
                  variant="outline" 
                  className="text-xs border-[#e5e7eb] text-[#6b7280] bg-[#f3f4f6] hover:bg-[#dbeafe] hover:text-[#1e3a8a] hover:border-[#93c5fd] transition-colors duration-200"
                >
                  {document.category}
                </Badge>
                
                {document.needsSignature && (
                  <Badge 
                    variant={document.signed ? "outline" : "destructive"} 
                    className={`text-xs ${
                      document.signed 
                        ? "border-[#10b981] text-[#10b981] bg-[#f0fdf4]" 
                        : "border-[#ef4444] text-[#ef4444] bg-[#fef2f2]"
                    }`}
                  >
                    {document.signed ? "Assinado" : "Requer Assinatura"}
                  </Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs text-[#6b7280] mb-4">
                <span>{formatDate(document.uploadDate)}</span>
                <span className="font-medium">{document.size}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6b7280]">
                  Enviado por: <span className="font-medium text-[#000000]">{document.uploadedBy}</span>
                </span>
                
                <div className="flex space-x-2">
                  {document.needsSignature && !document.signed && (
                    <Button 
                      size="sm" 
                      className="text-xs py-1.5 px-3 h-auto bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Assinar
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs py-1.5 px-3 h-auto border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#000000] hover:border-[#93c5fd] transition-all duration-200" 
                    onClick={handleDownload}
                    disabled={isLoading || !document.filePath}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs py-1.5 px-3 h-auto transition-all duration-200 ${
                      canPreview && !isLoading && document.filePath
                        ? "border-[#e5e7eb] text-[#6b7280] hover:bg-[#dbeafe] hover:text-[#1e3a8a] hover:border-[#3b82f6]"
                        : "border-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                    }`}
                    onClick={canPreview ? handlePreview : undefined}
                    disabled={!canPreview || isLoading || !document.filePath}
                    title={!canPreview ? "Visualização não disponível para este tipo de arquivo" : ""}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </div>
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
