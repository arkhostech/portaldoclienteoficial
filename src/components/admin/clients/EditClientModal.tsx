
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client, ClientFormData } from "@/services/clients/types";
import { EditClientTab } from "./components/tabs/EditClientTab";
import { PasswordResetTab } from "./components/tabs/PasswordResetTab";
import { usePasswordReset } from "@/hooks/usePasswordReset";

interface EditClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: ClientFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

const EditClientModal = ({
  client,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting
}: EditClientModalProps) => {
  const [activeTab, setActiveTab] = useState<"edit" | "password">("edit");
  const { resetPassword, isSubmitting: isResettingPassword } = usePasswordReset({
    onSuccess: () => setActiveTab("edit")
  });

  // Reset tab when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setActiveTab("edit");
      }, 100);
    }
  }, [open]);
  
  const handleDialogClose = (open: boolean) => {
    if (!(isSubmitting || isResettingPassword) && open === false) {
      onOpenChange(open);
    }
  };

  const handleSubmit = async (data: ClientFormData) => {
    if (!client) return;
    
    try {
      const success = await onSubmit(client.id, data);
      
      if (success) {
        setTimeout(() => {
          onOpenChange(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePasswordReset = async (password: string) => {
    if (!client) return;
    await resetPassword(client.id, password);
  };

  // Map client data to ClientFormData that includes process_type 
  const clientFormData = client ? {
    ...client,
    process_type: client.process_type || ""
  } : null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize os dados do cliente
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "password")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="password">
              Resetar Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            {clientFormData && (
              <EditClientTab 
                client={clientFormData}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => handleDialogClose(false)}
              />
            )}
          </TabsContent>

          <TabsContent value="password">
            <PasswordResetTab 
              isSubmitting={isResettingPassword}
              onSubmit={handlePasswordReset}
              onBack={() => setActiveTab("edit")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;
