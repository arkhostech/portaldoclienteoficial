import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { BasicInfoFields } from "../BasicInfoFields";
import { ClientFormData } from "@/services/clients/types";

const editClientSchema = z.object({
  full_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string()
    .regex(/^\d{10}$/, { message: "Telefone deve ter 10 dígitos" })
    .optional(),
  status: z.enum(["documentacao", "em_andamento", "concluido"]),
  process_type: z.string().optional()
});

type EditFormData = z.infer<typeof editClientSchema>;

type EditClientTabProps = {
  client: ClientFormData;
  isSubmitting: boolean;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
};

export const EditClientTab = ({ client, isSubmitting, onSubmit, onCancel }: EditClientTabProps) => {
  const form = useForm<EditFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      full_name: client.full_name,
      email: client.email,
      phone: client.phone || "",
      status: client.status,
      process_type: client.process_type || ""
    }
  });

  const handleSubmit = async (data: EditFormData) => {
    await onSubmit(data as ClientFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Atualizar
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
