
import { UseFormReturn } from "react-hook-form";
import { ClientFormData } from "../schemas/clientSchema";
import { PersonalInfoFields } from "./fields/PersonalInfoFields";
import { ContactInfoFields } from "./fields/ContactInfoFields";
import { ProcessTypeField } from "./fields/ProcessTypeField";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ClientFormData & { confirmPassword: string }>;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  return (
    <>
      <PersonalInfoFields form={form} />
      <ContactInfoFields form={form} />
      <ProcessTypeField form={form} />
    </>
  );
};
