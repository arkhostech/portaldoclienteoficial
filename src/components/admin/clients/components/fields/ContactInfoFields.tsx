
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

interface ContactInfoFieldsProps {
  form: UseFormReturn<ClientFormData & { confirmPassword: string }>;
}

export const ContactInfoFields = ({ form }: ContactInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input {...field} placeholder="(XX) XXXXX-XXXX" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Endereço completo" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
