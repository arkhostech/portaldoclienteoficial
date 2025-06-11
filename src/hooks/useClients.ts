import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  fetchClients, 
  createClient, 
  createClientWithAuth,
  updateClient, 
  deleteClient,
  deleteClientWithCascade,
  resetClientPassword,
  ClientFormData,
  ClientWithAuthFormData,
  Client 
} from "@/services/clients";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (data: ClientFormData | ClientWithAuthFormData) => {
    setIsSubmitting(true);
    
    try {
      let result;
      
      if ('password' in data) {
        result = await createClientWithAuth(data);
      } else {
        result = await createClient(data);
      }
      
      if (result) {
        // Instead of adding the raw result, reload all clients to get proper process_type data
        await loadClients();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cliente");
      return false;
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  const handleUpdateClient = async (id: string, data: Partial<ClientFormData>) => {
    setIsSubmitting(true);
    
    try {
      console.log(`In handleUpdateClient - Updating client ${id} with data:`, data);
      
      if (Object.keys(data).length === 0) {
        console.error("Attempting to update with empty data");
        toast.error("Erro ao atualizar cliente: dados vazios");
        return false;
      }
      
      const result = await updateClient(id, data);
      
      if (result) {
        // Reload all clients to get proper process_type data
        await loadClients();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
      return false;
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  const handleResetPassword = async (id: string, password: string) => {
    setIsSubmitting(true);
    
    try {
      const success = await resetClientPassword(id, password);
      return success;
    } catch (error) {
      console.error("Error resetting client password:", error);
      toast.error("Erro ao redefinir senha do cliente");
      return false;
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  const handleDeleteClient = async (id: string, cascade = false) => {
    setIsSubmitting(true);
    
    try {
      const success = cascade 
        ? await deleteClientWithCascade(id)
        : await deleteClient(id);
      
      if (success) {
        setClients(prevClients => prevClients.filter(c => c.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
      return false;
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  const selectClient = useCallback((client: Client | null) => {
    setSelectedClient(client);
  }, []);

  return {
    clients,
    selectedClient,
    isLoading,
    isSubmitting,
    loadClients,
    handleCreateClient,
    handleUpdateClient,
    handleDeleteClient,
    handleResetPassword,
    selectClient
  };
};
