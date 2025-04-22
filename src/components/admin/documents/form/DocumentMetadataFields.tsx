
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface DocumentMetadataFieldsProps {
  defaultTitle?: string;
}

export const DocumentMetadataFields: React.FC<DocumentMetadataFieldsProps> = ({
  defaultTitle,
}) => {
  const form = useFormContext();

  // On mount, set the default title if provided and the field is empty
  useEffect(() => {
    if (defaultTitle && !form.getValues("title")) {
      form.setValue("title", defaultTitle);
    }
  }, [defaultTitle, form]);

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título*</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Título do documento"
                required
                minLength={1}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Input placeholder="Descrição (opcional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
