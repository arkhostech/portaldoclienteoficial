
import React from "react";
import imageCompression from 'browser-image-compression';

// Function to highlight matched text in a string
export const highlightMatch = (text: string, term: string) => {
  if (!term || term === "") return text;
  
  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded-sm">{part}</mark> : part
  );
};

// Function to compress images before upload
export const compressImage = async (file: File): Promise<File> => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  try {
    console.log('Compressing image:', file.name, file.size);
    const compressedFile = await imageCompression(file, options);
    console.log('Compression complete:', compressedFile.size);
    return compressedFile;
  } catch (error) {
    console.error("Compression failed:", error);
    return file;
  }
};

// Function to create a preview URL for an image
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};
