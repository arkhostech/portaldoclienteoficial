
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAuth } from "@/contexts/auth";
import { useClients } from "@/hooks/useClients";
import MainLayout from "@/components/Layout/MainLayout";
import StageColumn from "@/components/admin/client-stages/StageColumn";
import ClientCard from "@/components/admin/client-stages/ClientCard";
import { Client, ProcessStatus } from "@/services/clients/types";
import { processStatusOptions } from "@/components/admin/clients/schemas/clientSchema";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Users } from "lucide-react";
import { toast } from "sonner";

const ClientStages = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { clients, isLoading, handleUpdateClient, loadClients } = useClients();

  // Group clients by status
  const [groupedClients, setGroupedClients] = useState<Record<ProcessStatus, Client[]>>({
    documentacao: [],
    em_andamento: [],
    concluido: []
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  // Load and group clients by status
  useEffect(() => {
    if (clients.length > 0) {
      const grouped: Record<ProcessStatus, Client[]> = {
        documentacao: [],
        em_andamento: [],
        concluido: []
      };

      clients.forEach(client => {
        if (client.status && (client.status === "documentacao" || 
                              client.status === "em_andamento" || 
                              client.status === "concluido")) {
          // Only push to grouped if the status is one of our defined columns
          grouped[client.status as ProcessStatus].push(client);
        } else {
          // Default to documentation if no status or invalid status
          grouped.documentacao.push({
            ...client,
            status: "documentacao" 
          });
        }
      });

      setGroupedClients(grouped);
    }
  }, [clients]);

  // Handle dropping a card into a new column
  const handleDrop = async (clientId: string, newStatus: ProcessStatus) => {
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      toast.error("Cliente não encontrado");
      return;
    }
    
    if (client.status === newStatus) {
      return; // No change needed
    }
    
    const success = await handleUpdateClient(clientId, {
      ...client,
      status: newStatus
    });
    
    if (success) {
      // Update grouped clients locally for immediate UI update
      setGroupedClients(prev => {
        const updatedGroups = { ...prev };
        
        // Remove from previous group
        if (client.status && updatedGroups[client.status as ProcessStatus]) {
          updatedGroups[client.status as ProcessStatus] = updatedGroups[client.status as ProcessStatus].filter(
            c => c.id !== clientId
          );
        }
        
        // Add to new group with updated status
        updatedGroups[newStatus] = [
          ...updatedGroups[newStatus],
          { ...client, status: newStatus }
        ];
        
        return updatedGroups;
      });
      
      toast.success(`Status do cliente atualizado para ${processStatusOptions.find(opt => opt.value === newStatus)?.label}`);
    }
  };

  return (
    <MainLayout title="Estágios Clientes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Estágios Clientes</h2>
            <p className="text-muted-foreground">
              Gerencie o progresso dos clientes em diferentes fases do processo
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/clients")}
            >
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Clientes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => loadClients()}
              disabled={isLoading}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <DndProvider backend={HTML5Backend}>
          <div className="flex space-x-4 overflow-x-auto pb-6">
            <StageColumn 
              title="Documentação" 
              status="documentacao" 
              onDrop={handleDrop}
            >
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Carregando...</div>
              ) : groupedClients.documentacao.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">Nenhum cliente nesta fase</div>
              ) : (
                groupedClients.documentacao.map(client => (
                  <ClientCard key={client.id} client={client} />
                ))
              )}
            </StageColumn>

            <StageColumn 
              title="Em Andamento" 
              status="em_andamento" 
              onDrop={handleDrop}
            >
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Carregando...</div>
              ) : groupedClients.em_andamento.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">Nenhum cliente nesta fase</div>
              ) : (
                groupedClients.em_andamento.map(client => (
                  <ClientCard key={client.id} client={client} />
                ))
              )}
            </StageColumn>

            <StageColumn 
              title="Concluído" 
              status="concluido" 
              onDrop={handleDrop}
            >
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">Carregando...</div>
              ) : groupedClients.concluido.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">Nenhum cliente nesta fase</div>
              ) : (
                groupedClients.concluido.map(client => (
                  <ClientCard key={client.id} client={client} />
                ))
              )}
            </StageColumn>
          </div>
        </DndProvider>
      </div>
    </MainLayout>
  );
};

export default ClientStages;
