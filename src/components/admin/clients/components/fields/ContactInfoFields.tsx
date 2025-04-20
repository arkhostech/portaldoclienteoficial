
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ClientFormData } from "../../schemas/clientSchema";
import { formatPhoneNumber, normalizePhoneNumber } from "@/lib/utils/phoneFormat";

interface ContactInfoFieldsProps {
  form: UseFormReturn<ClientFormData>;
}

export const ContactInfoFields = ({ form }: ContactInfoFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Telefone</FormLabel>
          <FormControl>
            <Input 
              {...field}
              placeholder="(555) 123-4567"
              value={formatPhoneNumber(field.value || '')}
              onChange={(e) => {
                const normalized = normalizePhoneNumber(e.target.value);
                field.onChange(normalized);
              }}
              maxLength={14} // (XXX) XXX-XXXX = 14 characters
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
