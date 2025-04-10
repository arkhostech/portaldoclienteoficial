
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  fetchClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  ClientFormData, 
  Client 
} from "@/services/clientService";

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
    const data = await fetchClients();
    setClients(data);
    setIsLoading(false);
  };

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      const result = await createClient(data);
      if (result) {
        setClients([result, ...clients]);
        toast.success("Cliente criado com sucesso");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cliente");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (id: string, data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      const result = await updateClient(id, data);
      if (result) {
        setClients(clients.map(c => c.id === result.id ? result : c));
        toast.success("Cliente atualizado com sucesso");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      setIsSubmitting(true);
      const success = await deleteClient(id);
      if (success) {
        setClients(clients.filter(c => c.id !== id));
        toast.success("Cliente excluído com sucesso");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClient = (client: Client | null) => {
    setSelectedClient(client);
  };

  return {
    clients,
    selectedClient,
    isLoading,
    isSubmitting,
    loadClients,
    handleCreateClient,
    handleUpdateClient,
    handleDeleteClient,
    selectClient
  };
};
