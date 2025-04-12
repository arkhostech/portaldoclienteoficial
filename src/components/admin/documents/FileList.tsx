
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, X, Image } from "lucide-react";

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface FileListProps {
  files: FileWithPreview[];
  onRemove: (id: string) => void;
}

const FileList = ({ files, onRemove }: FileListProps) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Arquivos selecionados ({files.length})</p>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {files.map(file => (
          <div 
            key={file.id}
            className="flex items-center justify-between bg-muted rounded-md p-2"
          >
            <div className="flex items-center gap-2 truncate">
              {file.type.startsWith('image/') ? (
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="h-9 w-9 rounded object-cover"
                    />
                  ) : (
                    <Image className="h-4 w-4 text-primary" />
                  )}
                </div>
              ) : (
                <FileText className="h-4 w-4 text-primary" />
              )}
              <div className="flex flex-col">
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)} KB)
                  {file.type.startsWith('image/') && file.preview && " • Comprimida"}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
