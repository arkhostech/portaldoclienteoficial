import { FileText, Image, File } from "lucide-react";
import { useDocumentDownload } from "@/hooks/documents/operations/useDocumentDownload";

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

export const ensureFileExtension = (fileName: string, mimeType: string): string => {
  const hasKnownExtension = /\.[a-z0-9]{2,5}$/i.test(fileName);
  if (hasKnownExtension) return fileName;

  const extensionMap: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/jpg": ".jpg",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/zip": ".zip"
    // Add more as needed
  };

  const extension = extensionMap[mimeType] || "";
  return fileName + extension;
};

export const handleDocumentDownload = async (filePath: string | null, fileName: string) => {
  const { handleDownloadDocument } = useDocumentDownload();
  return handleDownloadDocument({ filePath, fileName });
};
