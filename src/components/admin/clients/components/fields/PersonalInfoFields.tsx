
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

interface PersonalInfoFieldsProps {
  form: UseFormReturn<ClientFormData & { confirmPassword: string }>;
}

export const PersonalInfoFields = ({ form }: PersonalInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo*</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome Completo" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email*</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="email@exemplo.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
