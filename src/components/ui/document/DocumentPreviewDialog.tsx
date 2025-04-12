
import { Download, File } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientDocumentView } from "@/services/documents/types";
import { useEffect, useState } from "react";

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  document: ClientDocumentView;
}

const DocumentPreviewDialog = ({ isOpen, onClose, documentUrl, document: docData }: DocumentPreviewDialogProps) => {
  const [loadError, setLoadError] = useState(false);
  
  useEffect(() => {
    // Reset error state when dialog opens
    if (isOpen) {
      setLoadError(false);
    }
    
    // Log debug information for troubleshooting
    if (isOpen && documentUrl === null) {
      console.error('documentUrl is null. Check if file_path is valid and if Supabase returned a signed URL:', {
        filePath: docData.filePath,
        documentName: docData.name,
        documentType: docData.type
      });
    }
  }, [isOpen, documentUrl, docData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isPDF = docData.type.toLowerCase().includes("pdf");
  const isImage = ["jpg", "jpeg", "png", "image/jpeg", "image/png", "image/jpg"].some(ext => 
    docData.type.toLowerCase().includes(ext)
  );

  const handleDownload = () => {
    if (documentUrl) {
      const link = window.document.createElement("a");
      link.href = documentUrl;
      link.download = docData.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{docData.name}</span>
            <div className="text-sm text-muted-foreground font-normal">
              {formatDate(docData.uploadDate)} • {docData.size}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4">
          {documentUrl ? (
            isPDF ? (
              <iframe 
                src={`${documentUrl}#toolbar=0`}
                className="w-full h-[70vh] border rounded-md"
                title={docData.name}
                onLoad={() => setLoadError(false)}
                onError={() => setLoadError(true)}
              />
            ) : isImage ? (
              <div className="w-full h-[70vh] flex items-center justify-center bg-muted/20 rounded-md">
                <img 
                  src={documentUrl} 
                  alt={docData.name} 
                  className="max-w-full max-h-[70vh] object-contain"
                  onLoad={() => setLoadError(false)}
                  onError={() => setLoadError(true)}
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
            <div className="w-full h-[30vh] flex flex-col items-center justify-center bg-muted/20 rounded-md">
              <File className="h-16 w-16 text-gray-400 mb-3" />
              <p className="text-center text-muted-foreground">
                Erro ao carregar documento. O arquivo pode não estar disponível ou você não tem permissão para acessá-lo.
              </p>
              <Button onClick={onClose} className="mt-4">Fechar</Button>
            </div>
          )}

          {loadError && (
            <div className="w-full mt-4 p-4 border border-red-300 rounded bg-red-50 text-red-700 text-center">
              Erro ao carregar o documento. Formato não suportado ou arquivo indisponível.
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button 
            onClick={handleDownload} 
            disabled={!documentUrl}
            title={!documentUrl ? "Arquivo não disponível para download" : "Baixar arquivo"}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
