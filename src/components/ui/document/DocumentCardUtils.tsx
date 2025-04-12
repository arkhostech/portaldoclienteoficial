
import { FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { getDocumentUrl } from "@/services/documents/documentUrl";

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
    console.error("Missing file path for download", { fileName });
    return;
  }

  const toastId = toast.loading("Preparando o download...");

  try {
    const signedUrl = await getDocumentUrl(filePath);
    if (!signedUrl) throw new Error("Signed URL is null");

    const response = await fetch(signedUrl);
    const contentType = response.headers.get("Content-Type") || "";

    if (!response.ok || contentType.includes("text/html")) {
      throw new Error(`Unexpected content type or error response: ${contentType}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    toast.dismiss(toastId);
    toast.success("Download iniciado");
  } catch (error) {
    console.error("Secure download failed:", error, { filePath, fileName });
    toast.dismiss(toastId);
    toast.error("Erro ao baixar o documento");
  }
};
