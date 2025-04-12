
import { Download, Eye, File, FileText, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClientDocumentView } from "@/services/documents/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDocumentUrl } from "@/services/documents/documentUrl";
import { toast } from "sonner";

interface DocumentCardProps {
  document: ClientDocumentView;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = () => {
    switch (document.type) {
      case "PDF":
      case "application/pdf":
        return <FileText className="h-10 w-10 text-red-500" />;
      case "JPG":
      case "JPEG":
      case "PNG":
      case "image/jpeg":
      case "image/png":
      case "image/jpg":
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

  const isPreviewable = (fileType: string) => {
    const previewableTypes = [
      "pdf", "PDF", "application/pdf",
      "jpg", "JPG", "jpeg", "JPEG", "png", "PNG", 
      "image/jpeg", "image/png", "image/jpg"
    ];
    return previewableTypes.some(type => fileType.includes(type));
  };

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

  const handleDownload = async () => {
    if (!document.filePath) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }

    const toastId = toast.loading("Preparando o download...");
    
    try {
      const url = await getDocumentUrl(document.filePath);
      
      if (url) {
        toast.dismiss(toastId);
        toast.success("Download iniciado");
        
        // Create an anchor element and trigger download
        const link = window.document.createElement("a");
        link.href = url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        toast.dismiss(toastId);
        toast.error("Erro ao gerar link para download");
      }
    } catch (error) {
      console.error("Error getting document URL:", error);
      toast.dismiss(toastId);
      toast.error("Erro ao acessar o documento");
    }
  };

  return (
    <>
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

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  document: ClientDocumentView;
}

const DocumentPreviewDialog = ({ isOpen, onClose, documentUrl, document }: DocumentPreviewDialogProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isPDF = document.type.toLowerCase().includes("pdf");
  const isImage = ["jpg", "jpeg", "png"].some(ext => 
    document.type.toLowerCase().includes(ext)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{document.name}</span>
            <div className="text-sm text-muted-foreground font-normal">
              {formatDate(document.uploadDate)} • {document.size}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4">
          {documentUrl ? (
            isPDF ? (
              <iframe 
                src={`${documentUrl}#toolbar=0`}
                className="w-full h-[70vh] border rounded-md"
                title={document.name}
              />
            ) : isImage ? (
              <div className="w-full h-[70vh] flex items-center justify-center bg-muted/20 rounded-md">
                <img 
                  src={documentUrl} 
                  alt={document.name} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-[30vh] flex flex-col items-center justify-center bg-muted/20 rounded-md">
                <File className="h-16 w-16 text-gray-400 mb-3" />
                <p className="text-center text-muted-foreground">
                  Visualização não disponível para este tipo de arquivo.
                </p>
                <Button onClick={onClose} className="mt-4">Fechar</Button>
              </div>
            )
          ) : (
            <div className="w-full h-[30vh] flex items-center justify-center">
              <p>Erro ao carregar documento</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => {
            // Create an anchor element and trigger download
            if (documentUrl) {
              const link = window.document.createElement("a");
              link.href = documentUrl;
              link.download = document.name;
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
