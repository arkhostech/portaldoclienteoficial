
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
    setIsSubmitting(true);
    
    try {
      const result = await createClient(data);
      
      if (result) {
        // Add new client to state
        setClients(prevClients => [result, ...prevClients]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cliente");
      return false;
    } finally {
      // Delay state update to prevent UI issues
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  // Update an existing client
  const handleUpdateClient = async (id: string, data: ClientFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await updateClient(id, data);
      
      if (result) {
        // Update client in the state
        setClients(prevClients => 
          prevClients.map(c => c.id === result.id ? result : c)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
      return false;
    } finally {
      // Delay state update to prevent UI issues
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  // Delete a client
  const handleDeleteClient = async (id: string) => {
    setIsSubmitting(true);
    
    try {
      const success = await deleteClient(id);
      
      if (success) {
        // Remove client from state
        setClients(prevClients => prevClients.filter(c => c.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
      return false;
    } finally {
      // Delay state update to prevent UI issues
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
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
