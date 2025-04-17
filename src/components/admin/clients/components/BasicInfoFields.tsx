
import { UseFormReturn } from "react-hook-form";
import { ClientFormData } from "@/services/clients/types";
import { PersonalInfoFields } from "./fields/PersonalInfoFields";
import { ContactInfoFields } from "./fields/ContactInfoFields";
import { ProcessTypeField } from "./fields/ProcessTypeField";

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
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
