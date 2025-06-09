
import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import MainLayout from '@/components/Layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { StageColumnType } from '@/components/admin/client-stages/types';
import StageColumn from '@/components/admin/client-stages/StageColumn';
import { Client } from '@/services/clients/types';
import { fetchClients } from '@/services/clients';
import { updateClient } from '@/services/clients/updateClient';

const ClientStages = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      try {
        const data = await fetchClients();
        console.log('Fetched clients:', data);
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleDragStart = (client: Client) => {
    console.log('Drag started with client:', client);
    setDraggedClient(client);
  };

  const handleDrop = async (clientId: string, newStatus: StageColumnType) => {
    console.log(`Drop handler: Moving client ${clientId} to ${newStatus}`);
    
    const statusToUpdate = newStatus === 'sem_estagio' ? null : newStatus;
    
    try {
      const result = await updateClient(clientId, { status: statusToUpdate });
      if (result) {
        // Reload all clients to get proper process_type data
        setIsLoading(true);
        try {
          const data = await fetchClients();
          setClients(data);
        } catch (error) {
          console.error('Error reloading clients:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.process_type && client.process_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const documentacaoClients = filteredClients.filter(
    (client) => client.status === 'documentacao'
  );
  const emAndamentoClients = filteredClients.filter(
    (client) => client.status === 'em_andamento'
  );
  const concluidoClients = filteredClients.filter(
    (client) => client.status === 'concluido'
  );

  return (
    <MainLayout title="Estágios dos Clientes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Estágios dos Clientes</h2>
            <p className="text-muted-foreground">
              Gerencie e acompanhe os clientes por estágios do processo
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DndProvider backend={HTML5Backend}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StageColumn
              title="Documentação"
              type="documentacao"
              clients={documentacaoClients}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
            <StageColumn
              title="Em Andamento"
              type="em_andamento"
              clients={emAndamentoClients}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
            <StageColumn
              title="Concluído"
              type="concluido"
              clients={concluidoClients}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          </div>
        </DndProvider>
      </div>
    </MainLayout>
  );
};

export default ClientStages;
