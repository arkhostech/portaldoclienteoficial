
import { FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { getDocumentUrl } from "@/services/documents/documentUrl";
import { supabase } from "@/integrations/supabase/client";

export const getFileIcon = (fileType: string) => {
  if (!fileType) return <File className="h-10 w-10 text-gray-500" />;
  
  const lowerType = fileType.toLowerCase();
  
  if (lowerType.includes("pdf") || lowerType === "application/pdf") {
    return <FileText className="h-10 w-10 text-red-500" />;
  } else if (
    lowerType.includes("jpg") || 
    lowerType.includes("jpeg") || 
    lowerType.includes("png") || 
    lowerType.includes("image/") ||
    lowerType === "image/jpeg" ||
    lowerType === "image/png" ||
    lowerType === "image/jpg"
  ) {
    return <Image className="h-10 w-10 text-blue-500" />;
  } else {
    return <File className="h-10 w-10 text-gray-500" />;
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", e, dateString);
    return '';
  }
};

export const isPreviewable = (fileType: string) => {
  if (!fileType) return false;
  
  const lowerType = fileType.toLowerCase();
  return (
    lowerType.includes("pdf") ||
    lowerType === "application/pdf" ||
    lowerType.includes("jpg") ||
    lowerType.includes("jpeg") ||
    lowerType.includes("png") ||
    lowerType === "image/jpeg" ||
    lowerType === "image/png" ||
    lowerType === "image/jpg"
  );
};

export const handleDocumentDownload = async (filePath: string | null, fileName: string) => {
  if (!filePath) {
    toast.error("Nenhum arquivo disponível para download");
    console.error("No file path available for download:", { fileName });
    return;
  }

  console.log(`Attempting to download: ${fileName} (${filePath})`);
  const toastId = toast.loading("Preparando o download...");
  
  try {
    console.log("Requesting signed URL for download:", filePath);
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Current user:", sessionData?.session?.user?.id || 'not authenticated');
    
    const url = await getDocumentUrl(filePath);
    
    if (url) {
      console.log("Successfully obtained signed URL for download");
      toast.dismiss(toastId);
      toast.success("Download iniciado");
      
      // Create an anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
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
