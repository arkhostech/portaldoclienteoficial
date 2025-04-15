
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ClientFormData, processTypes } from "../../schemas/clientSchema";

interface ProcessTypeFieldProps {
  form: UseFormReturn<ClientFormData>;
}

export const ProcessTypeField = ({ form }: ProcessTypeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="process_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Processo*</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de processo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {processTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
