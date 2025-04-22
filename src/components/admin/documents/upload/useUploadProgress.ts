
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
    if (files.length === 0) {
      console.error("No files selected");
      return;
    }

    console.log("Starting upload process with form data:", formData);
    console.log("Files to upload:", files.length);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let successCount = 0;
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i+1}/${totalFiles}: ${file.name}`);
        
        // Set up a progress simulation for this file
        const intervalId = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = Math.min(prev + 1, (i + 1) / totalFiles * 100 - 5);
            return newProgress;
          });
        }, 50);
        
        // Create the file data object to upload
        const fileData = { 
          title: file.name, // Always use the filename as title
          description: formData.description || "",
          client_id: formData.client_id,
          file
        };
        
        console.log("Uploading file with data:", {
          fileName: file.name,
          fileSize: file.size,
          clientId: fileData.client_id,
          description: fileData.description ? "Present" : "Empty"
        });
        
        // Perform the actual upload
        const success = await onUpload(fileData);
        console.log(`Upload result for file ${i+1}/${totalFiles}: ${success ? "Success" : "Failed"}`);
        
        clearInterval(intervalId);
        
        if (success) {
          successCount++;
        }
        
        // Update progress to show completion for this file
        setUploadProgress((i + 1) / totalFiles * 100);
      }
      
      console.log(`Upload completed. ${successCount}/${totalFiles} files uploaded successfully`);
      
      if (successCount > 0) {
        // Only close if at least one file was uploaded successfully
        console.log("Closing dialog due to successful upload");
        setTimeout(() => handleDialogClose(false), 500);
      } else {
        console.error("No files were uploaded successfully");
      }
    } catch (error) {
      console.error("Error during file upload process:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadProgress,
    handleSubmit
  };
};
