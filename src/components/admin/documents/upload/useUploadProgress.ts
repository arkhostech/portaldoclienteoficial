
import { useState } from "react";
import { DocumentFormValues } from "../types/form-types";
import { FileWithPreview } from "../types";

export const useUploadProgress = (
  files: FileWithPreview[],
  onUpload: (data: { title?: string; description?: string; client_id: string; file: File }) => Promise<boolean>,
  handleDialogClose: (open: boolean) => void,
  isSubmitting: boolean
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (formData: DocumentFormValues) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let successCount = 0;
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Include the file name as title if no title is provided
        const fileData = { 
          title: file.name, // Always use the filename as title
          description: formData.description,
          client_id: formData.client_id,
          file
        };
        
        const intervalId = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 1, (i + 1) / totalFiles * 100 - 5));
        }, 50);
        
        console.log("Uploading file:", fileData.title);
        const success = await onUpload(fileData);
        console.log("Upload result:", success);
        
        clearInterval(intervalId);
        
        if (success) {
          successCount++;
        }
        
        setUploadProgress((i + 1) / totalFiles * 100);
      }
      
      if (successCount > 0) {
        console.log("Upload completed successfully");
        handleDialogClose(false);
      } else {
        console.error("No files were uploaded successfully");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    handleSubmit
  };
};
