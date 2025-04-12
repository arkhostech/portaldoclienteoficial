
import { FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { getDocumentUrl } from "@/services/documents/documentUrl";

export const getFileIcon = (fileType: string) => {
  const lowerType = fileType.toLowerCase();
  
  if (lowerType.includes("pdf")) {
    return <FileText className="h-10 w-10 text-red-500" />;
  } else if (
    lowerType.includes("jpg") || 
    lowerType.includes("jpeg") || 
    lowerType.includes("png") || 
    lowerType.includes("image/")
  ) {
    return <Image className="h-10 w-10 text-blue-500" />;
  } else {
    return <File className="h-10 w-10 text-gray-500" />;
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const isPreviewable = (fileType: string) => {
  if (!fileType) return false;
  
  const lowerType = fileType.toLowerCase();
  return (
    lowerType.includes("pdf") ||
    lowerType.includes("jpg") ||
    lowerType.includes("jpeg") ||
    lowerType.includes("png") ||
    lowerType.includes("image/jpeg") ||
    lowerType.includes("image/png") ||
    lowerType.includes("image/jpg")
  );
};

export const handleDocumentDownload = async (filePath: string | null, fileName: string) => {
  if (!filePath) {
    toast.error("Nenhum arquivo disponível para download");
    return;
  }

  const toastId = toast.loading("Preparando o download...");
  
  try {
    const url = await getDocumentUrl(filePath);
    
    if (url) {
      toast.dismiss(toastId);
      toast.success("Download iniciado");
      
      // Create an anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.dismiss(toastId);
      console.error("Failed to get download URL:", { filePath, fileName });
      toast.error("Erro ao gerar link para download");
    }
  } catch (error) {
    console.error("Error getting document URL:", error, { filePath, fileName });
    toast.dismiss(toastId);
    toast.error("Erro ao acessar o documento");
  }
};
