
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { compressImage, createImagePreview } from "./DocumentsUtils";
import { X } from "lucide-react";

interface FileUploadFieldProps {
  onChange: (file: File | null) => void;
  isSubmitting: boolean;
  selectedFileName: string | null;
}

export function FileUploadField({ 
  onChange, 
  isSubmitting, 
  selectedFileName 
}: FileUploadFieldProps) {
  const { control } = useFormContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setIsCompressing(file.type.startsWith('image/'));
      
      // Generate preview immediately for better UX
      const initialPreview = await createImagePreview(file);
      setPreviewUrl(initialPreview);
      
      // Compress the image if it's an image file
      try {
        const processedFile = await compressImage(file);
        
        // If compression changed the file, update the preview
        if (file !== processedFile && file.type.startsWith('image/')) {
          const compressedPreview = await createImagePreview(processedFile);
          setPreviewUrl(compressedPreview);
        }
        
        onChange(processedFile);
      } catch (error) {
        console.error("Error processing file:", error);
        onChange(file); // Use original if compression fails
      } finally {
        setIsCompressing(false);
      }
    } else {
      setPreviewUrl(null);
      onChange(null);
    }
  };
  
  const clearPreview = () => {
    setPreviewUrl(null);
    onChange(null);
    // Reset the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  return (
    <FormField
      control={control}
      name="file"
      render={({ field: { value, onChange: _, ...field } }) => (
        <FormItem>
          <FormLabel>Arquivo*</FormLabel>
          <FormControl>
            <div className="flex flex-col space-y-4">
              <Input
                type="file"
                disabled={isSubmitting}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                {...field}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isSubmitting}
                >
                  Escolher arquivo
                </Button>
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {isCompressing ? "Comprimindo..." : selectedFileName || "Nenhum arquivo selecionado"}
                </span>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearPreview}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {previewUrl && previewUrl.startsWith('data:image/') && (
                <div className="relative mt-2 max-w-md">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="rounded-md border max-h-[200px] max-w-full object-contain"
                  />
                  {isCompressing && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview da imagem comprimida
                  </p>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
