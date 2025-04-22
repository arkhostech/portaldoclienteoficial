
import { useState, useCallback, useRef, useEffect } from "react";
import { FileWithPreview } from "../types";
import { compressImage, createImagePreview } from "../DocumentsUtils";

export const useFileSelection = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const processFiles = async (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) setIsCompressing(true);
    const processedFiles: FileWithPreview[] = [];
    for (const file of newFiles) {
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        try {
          processedFile = await compressImage(file);
        } catch (error) {
          console.error("Error compressing image:", error);
          processedFile = file;
        }
      }
      const preview = await createImagePreview(processedFile);
      processedFiles.push(Object.assign(processedFile, {
        id: Math.random().toString(36).substring(2),
        preview
      }));
    }
    setIsCompressing(false);
    return processedFiles;
  };
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const processedFiles = await processFiles(acceptedFiles);
    setFiles(prevFiles => [
      ...prevFiles,
      ...processedFiles
    ]);
  }, []);
  
  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const processedFiles = await processFiles(filesArray);
      setFiles(prevFiles => [...prevFiles, ...processedFiles]);
    }
  };

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return {
    files,
    setFiles,
    isCompressing,
    fileInputRef,
    onDrop,
    removeFile,
    handleBrowseFiles,
    handleFileChange
  };
};
