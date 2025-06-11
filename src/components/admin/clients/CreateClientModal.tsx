import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { ClientWithAuthFormData } from "@/services/clients/types";
import { clientFormSchema, ClientFormData } from "./schemas/clientSchema";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { PasswordFields } from "./components/PasswordFields";

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientWithAuthFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

const CreateClientModal = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: CreateClientModalProps) => {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      status: "documentacao",
      process_type: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleSubmit = async (data: ClientFormData) => {
    // Remove confirmPassword before submitting
    const { confirmPassword, ...clientData } = data;
    
    const success = await onSubmit(clientData as ClientWithAuthFormData);
    if (success) {
      handleDialogClose(false);
      form.reset();
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      onOpenChange(open);
      setTimeout(() => {
        form.reset();
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white rounded-[18px] shadow-[0_12px_40px_rgba(5,61,56,0.13)] border border-[#053D38]/10 outline outline-1 outline-[#053D38]/10"
      >
        <DialogHeader>
          <DialogTitle className="text-[#14140F] text-[1.5rem] font-bold">Criar Novo Cliente com Acesso</DialogTitle>
          <DialogDescription className="text-[#34675C] text-[1rem]">Preencha os dados para criar um cliente com acesso ao portal</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <BasicInfoFields form={form} />
            <PasswordFields form={form} />
            <DialogFooter className="flex gap-4 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogClose(false)}
                disabled={isSubmitting}
                className="border border-[#e5e7eb] text-[#053D38] hover:bg-[#f0f9f4] rounded-lg px-6 py-3 font-semibold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#053D38] hover:bg-[#34675C] text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar com Acesso
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientModal;
