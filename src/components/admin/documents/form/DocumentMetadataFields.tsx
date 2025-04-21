
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

export const DocumentMetadataFields: React.FC = () => {
  const form = useFormContext();

  return (
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
  );
};
