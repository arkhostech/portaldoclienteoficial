
import React, { useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  filesCount: number;
  onBrowse: () => void;
  isCompressing?: boolean;
}

const FileDropzone = ({ onDrop, filesCount, onBrowse, isCompressing = false }: FileDropzoneProps) => {
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onDrop(filesArray);
    }
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer",
        filesCount > 0 ? "border-primary/20 bg-primary/5" : "border-gray-300 hover:border-primary/30"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={onBrowse}
    >
      {isCompressing ? (
        <Loader2 className="h-10 w-10 mb-2 text-primary animate-spin" />
      ) : (
        <Upload className={cn(
          "h-10 w-10 mb-2", 
          filesCount > 0 ? "text-primary" : "text-gray-400"
        )} />
      )}
      <div className="text-center">
        <p className="font-medium">
          {isCompressing ? "Comprimindo imagens..." : "Clique para adicionar arquivos"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isCompressing 
            ? "Por favor aguarde..." 
            : "ou arraste e solte aqui"}
        </p>
      </div>
    </div>
  );
};

export default FileDropzone;
