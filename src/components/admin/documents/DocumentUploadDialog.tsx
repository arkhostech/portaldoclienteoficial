
import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import FileDropzone from "./FileDropzone";
import FileList from "./FileList";
import DocumentUploadForm from "./DocumentUploadForm";
import { DocumentUploadDialogProps, FileWithPreview } from "./types";
import { DocumentFormValues } from "./DocumentUploadForm";

const DocumentUploadDialog = ({
  open,
  onOpenChange,
  onUpload,
  isSubmitting,
  clients,
  preSelectedClientId
}: DocumentUploadDialogProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        id: Math.random().toString(36).substring(2),
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, []);
  
  const removeFile = (id: string) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== id);
      return updatedFiles;
    });
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onDrop(filesArray);
    }
  };

  const handleSubmit = async (formData: DocumentFormValues) => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let successCount = 0;
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData = { 
          title: totalFiles > 1 ? `${formData.title} (${i + 1})` : formData.title,
          description: formData.description,
          client_id: formData.client_id,
          file
        };
        
        const intervalId = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 1, (i + 1) / totalFiles * 100 - 5));
        }, 50);
        
        const success = await onUpload(fileData);
        
        clearInterval(intervalId);
        
        if (success) {
          successCount++;
        }
        
        setUploadProgress((i + 1) / totalFiles * 100);
      }
      
      if (successCount > 0) {
        setFiles([]);
        handleDialogClose(false);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isUploading && !isSubmitting && open === false) {
      onOpenChange(open);
      setFiles(prevFiles => {
        prevFiles.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
        return [];
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          
          <FileDropzone 
            onDrop={onDrop} 
            filesCount={files.length} 
            onBrowse={handleBrowseFiles} 
          />
          
          <FileList files={files} onRemove={removeFile} />

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }} 
              />
            </div>
          )}
          
          <DocumentUploadForm 
            clients={clients}
            preSelectedClientId={preSelectedClientId}
            isSubmitting={isSubmitting || isUploading}
            onCancel={() => handleDialogClose(false)}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
