
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file || null);
  };
  
  return (
    <FormField
      control={control}
      name="file"
      render={({ field: { value, onChange: _, ...field } }) => (
        <FormItem>
          <FormLabel>Arquivo*</FormLabel>
          <FormControl>
            <div className="flex flex-col space-y-2">
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
                  {selectedFileName || "Nenhum arquivo selecionado"}
                </span>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
