import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileWithPreview } from "../types";
import { FileText } from "lucide-react";

interface MultipleDocumentFieldsProps {
  files: FileWithPreview[];
}

export const MultipleDocumentFields: React.FC<MultipleDocumentFieldsProps> = ({
  files,
}) => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">
          Nomes dos documentos ({files.length} arquivos)
        </h3>
        <div className="space-y-3">
          {files.map((file, index) => (
            <FormField
              key={`${file.id}-${index}`}
              control={form.control}
              name={`fileTitles.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span className="font-normal text-muted-foreground">
                      {file.name}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome do documento"
                      required
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição (aplicada a todos)</FormLabel>
            <FormControl>
              <Input placeholder="Descrição (opcional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}; 