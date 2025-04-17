
import { z } from "zod";

// Schema for client data with auth
export const clientFormSchema = z.object({
  full_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string().default("documentacao"),
  process_type: z.string().min(1, { message: "Tipo de processo é obrigatório" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Confirme a senha" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// Status options for client process
export const processStatusOptions = [
  { value: "documentacao", label: "Documentação" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" }
];

// Common process types for immigration
export const processTypes = [
  "EB-1",
  "EB-2",
  "EB-3",
  "EB-5",
  "H-1B",
  "L-1",
  "O-1",
  "Tourist Visa",
  "Student Visa",
  "Family Immigration",
  "Asylum",
  "Naturalization",
  "Green Card",
  "Other"
];
