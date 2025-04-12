
import { Document, getDocumentUrl } from "@/services/documents";
import { toast } from "sonner";
import { ensureFileExtension } from "@/components/ui/document/DocumentCardUtils";

export const useDocumentDownload = () => {
  // Main download function that accepts either a Document object or a filePath + fileName
  const handleDownloadDocument = async (documentOrPath: Document | { filePath: string | null, fileName: string }) => {
    // Handle different input types
    let filePath: string | null;
    let fileName: string;
    
    if ('filePath' in documentOrPath && 'fileName' in documentOrPath) {
      // Input is already in the expected format
      filePath = documentOrPath.filePath;
      fileName = documentOrPath.fileName;
    } else {
      // Input is a Document object
      const document = documentOrPath as Document;
      filePath = document.file_path;
      fileName = document.title;
    }
    
    if (!filePath) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    const toastId = toast.loading("Preparando o download...");
    
    try {
      const url = await getDocumentUrl(filePath);
      
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
        const downloadFileName = ensureFileExtension(fileName, contentType);

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
        return true;
      } else {
        toast.dismiss(toastId);
        toast.error("Erro ao gerar link para download");
        return false;
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.dismiss(toastId);
      toast.error("Erro ao acessar o documento");
      return false;
    }
  };

  return {
    handleDownloadDocument
  };
};
