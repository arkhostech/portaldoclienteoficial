
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
import { ClientWithAuthFormData } from "@/services/clientService";
import { clientFormSchema } from "./schemas/clientSchema";
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
  const form = useForm<ClientWithAuthFormData & { confirmPassword: string }>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      process_type: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleSubmit = async (data: ClientWithAuthFormData & { confirmPassword: string }) => {
    // Remove confirmPassword before submitting
    const { confirmPassword, ...clientData } = data;
    
    const success = await onSubmit(clientData);
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Cliente com Acesso</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um cliente com acesso ao portal
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <BasicInfoFields form={form} />
            <PasswordFields form={form} />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogClose(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
