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
      <Card className="w-full hover:shadow-lg transition-all duration-200 border-0 shadow-md rounded-lg bg-transparent">
        <CardContent className="p-0">
          {/* Icon Section - Top Center Large */}
          <div
            className="p-6 rounded-t-lg flex flex-col items-center justify-center min-h-[140px]"
            style={{ background: 'linear-gradient(135deg, #053D38 0%, #34675C 100%)' }}
          >
            {getFileIcon(document.type, "text-white h-12 w-12")}
          </div>
          {/* Info Section */}
          <div className="p-3 rounded-b-lg" style={{ background: 'linear-gradient(135deg, #053D38 0%, #34675C 100%)' }}>
            <h4 className="font-semibold text-sm mb-1 text-center text-white truncate">
              {document.name}
            </h4>
            <p className="text-xs text-white/70 font-medium text-center mb-1">{document.category}</p>
            {document.needsSignature && (
              <div className="flex justify-center mb-2">
                <Badge 
                  variant="outline"
                  className={`text-xs font-medium ${
                    document.signed 
                      ? "bg-emerald-500/20 text-emerald-100 border-emerald-300/30" 
                      : "bg-red-500/20 text-red-100 border-red-300/30"
                  }`}
                >
                  {document.signed ? "✓ Assinado" : "⚠ Requer Assinatura"}
                </Badge>
              </div>
            )}
            <div className="flex justify-center items-center text-xs text-white/70 mb-2">
              <span>{formatDate(document.uploadDate)} • {document.size}</span>
            </div>
            <div className="flex flex-col space-y-2">
              {document.needsSignature && !document.signed && (
                <Button 
                  size="sm" 
                  className="w-full text-xs py-2 bg-white/20 hover:bg-white/30 text-white transition-all duration-200 border-white/30 font-semibold"
                  variant="outline"
                >
                  ✍️ Assinar
                </Button>
              )}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs py-2 bg-[#F26800] hover:bg-[#e05f00] text-white border-0 transition-all duration-200 font-semibold" 
                  onClick={handleDownload}
                  disabled={isLoading || !document.filePath}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex-1 text-xs py-2 transition-all duration-200 font-semibold ${
                    canPreview && !isLoading && document.filePath
                      ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
                      : "bg-white/10 border-white/20 text-white/50 cursor-not-allowed"
                  }`}
                  onClick={canPreview ? handlePreview : undefined}
                  disabled={!canPreview || isLoading || !document.filePath}
                  title={!canPreview ? "Visualização não disponível para este tipo de arquivo" : ""}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
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
