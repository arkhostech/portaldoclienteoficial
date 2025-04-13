
import * as z from "zod";

export const paymentSchema = z.object({
  client_id: z.string().uuid({ message: "Por favor selecione um cliente" }),
  title: z.string().min(2, { message: "Título deve ter pelo menos 2 caracteres" }),
  amount: z.string().min(1, { message: "Valor é obrigatório" }),
  due_date: z.date({ required_error: "Data de vencimento é obrigatória" }),
  description: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
