
import { Client } from "@/services/clients/types";
import { z } from "zod";

export const documentFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  status: z.string().default("active")
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;

export interface DocumentFormProps {
  clients: Client[];
  preSelectedClientId?: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: DocumentFormValues) => void;
}
