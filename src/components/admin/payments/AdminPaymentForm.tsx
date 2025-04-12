
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/services/clients/types";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const paymentSchema = z.object({
  client_id: z.string().uuid({ message: "Por favor selecione um cliente" }),
  title: z.string().min(2, { message: "Título deve ter pelo menos 2 caracteres" }),
  amount: z.string().min(1, { message: "Valor é obrigatório" }),
  due_date: z.date({ required_error: "Data de vencimento é obrigatória" }),
  description: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface AdminPaymentFormProps {
  clients: Client[];
  onSuccess?: () => void;
  initialData?: PaymentFormValues & { id: string };
}

export function AdminPaymentForm({ clients, onSuccess, initialData }: AdminPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or edit values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      client_id: "",
      title: "",
      amount: "",
      description: "",
    },
  });

  async function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);

    try {
      // Format amount if necessary (add currency symbol, etc.)
      const formattedAmount = data.amount.startsWith("$")
        ? data.amount
        : `$${data.amount}`;

      // Convert Date to ISO string for Supabase
      const formattedDueDate = data.due_date.toISOString();

      if (initialData?.id) {
        // Update existing payment
        const { error } = await supabase
          .from("scheduled_payments")
          .update({
            client_id: data.client_id,
            title: data.title,
            amount: formattedAmount,
            due_date: formattedDueDate,
            description: data.description || null,
          })
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Pagamento atualizado com sucesso");
      } else {
        // Create new payment
        const { error } = await supabase.from("scheduled_payments").insert({
          client_id: data.client_id,
          title: data.title,
          amount: formattedAmount,
          due_date: formattedDueDate,
          description: data.description || null,
        });

        if (error) throw error;
        toast.success("Pagamento agendado com sucesso");
      }

      // Reset form and call onSuccess callback if provided
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving payment:", error);
      toast.error(`Erro ao salvar pagamento: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Client Select */}
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Pagamento*</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Taxa de Processo" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor*</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 500.00" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Vencimento*</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais sobre o pagamento..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Salvando...
              </>
            ) : initialData ? (
              "Atualizar Pagamento"
            ) : (
              "Agendar Pagamento"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
