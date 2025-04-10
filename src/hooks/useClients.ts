
import { useState, useEffect, useCallback } from "react";
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

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Function to load clients
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

  // Create a new client
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
      // Use setTimeout to ensure UI updates properly before state changes
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    }
  };

  // Update an existing client
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
      // Use setTimeout to ensure UI updates properly before state changes
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    }
  };

  // Delete a client
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
      // Use setTimeout to ensure UI updates properly before state changes
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    }
  };

  // Select a client for editing or deletion
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
    selectClient
  };
};
