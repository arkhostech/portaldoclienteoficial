
import { FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { getDocumentUrl } from "@/services/documents/documentUrl";

export const getFileIcon = (fileType: string) => {
  switch (fileType) {
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

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const isPreviewable = (fileType: string) => {
  const previewableTypes = [
    "pdf", "PDF", "application/pdf",
    "jpg", "JPG", "jpeg", "JPEG", "png", "PNG", 
    "image/jpeg", "image/png", "image/jpg"
  ];
  return previewableTypes.some(type => fileType.includes(type));
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
      toast.error("Erro ao gerar link para download");
    }
  } catch (error) {
    console.error("Error getting document URL:", error);
    toast.dismiss(toastId);
    toast.error("Erro ao acessar o documento");
  }
};
