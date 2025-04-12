
import { Document, getDocumentUrl } from "@/services/documents";
import { toast } from "sonner";
import { ensureFileExtension } from "@/components/ui/document/DocumentCardUtils";

export const useDocumentDownload = () => {
  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    const toastId = toast.loading("Preparando o download...");
    
    try {
      const url = await getDocumentUrl(document.file_path);
      
      if (url) {
        // Use fetch to get the file as a blob
        const response = await fetch(url);
        const contentType = response.headers.get("Content-Type") || "";

        if (!response.ok || contentType.includes("text/html")) {
          throw new Error(`Unexpected content type or error response: ${contentType}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Apply correct file extension based on content type
        const downloadFileName = ensureFileExtension(document.title, contentType);

        // Create and trigger download via an anchor element
        const link = window.document.createElement("a");
        link.href = blobUrl;
        link.download = downloadFileName;
        link.style.display = "none";
        
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
        
        toast.dismiss(toastId);
        toast.success("Download iniciado");
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

  return {
    handleDownloadDocument
  };
};
