
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

interface EditClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: ClientFormData) => Promise<boolean>;
  onResetPassword?: (id: string, password: string) => Promise<boolean>;
  isSubmitting: boolean;
}

const EditClientModal = ({
  client,
  open,
  onOpenChange,
  onSubmit,
  onResetPassword,
  isSubmitting
}: EditClientModalProps) => {
  const [activeTab, setActiveTab] = useState<"edit" | "password">("edit");

  // Reset tab when modal opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setActiveTab("edit");
      }, 100);
    }
  }, [open]);
  
  const handleDialogClose = (open: boolean) => {
    if (!isSubmitting && open === false) {
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
    if (!client || !onResetPassword) return;
    
    try {
      const success = await onResetPassword(client.id, password);
      
      if (success) {
        setActiveTab("edit");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

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
            <TabsTrigger value="password" disabled={!onResetPassword}>
              Resetar Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            {client && (
              <EditClientTab 
                client={client}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => handleDialogClose(false)}
              />
            )}
          </TabsContent>

          <TabsContent value="password">
            <PasswordResetTab 
              isSubmitting={isSubmitting}
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
