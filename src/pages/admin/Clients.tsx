import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, ArrowRight, Clock, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Client } from "@/services/clientService";
import { useClients } from "@/hooks/useClients";
import ClientsTable from "@/components/admin/clients/ClientsTable";
import CreateClientModal from "@/components/admin/clients/CreateClientModal";
import EditClientModal from "@/components/admin/clients/EditClientModal";
import DeleteClientModal from "@/components/admin/clients/DeleteClientModal";

const Clients = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { 
    clients, 
    selectedClient, 
    isLoading, 
    isSubmitting, 
    handleCreateClient, 
    handleUpdateClient,
    handleDeleteClient,
    selectClient, 
    loadClients
  } = useClients();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  // Handle opening edit dialog
  const handleEditClient = (client: Client) => {
    selectClient(client);
    // Add a slight delay to ensure client data is set before dialog opens
    setTimeout(() => {
      setOpenEditDialog(true);
    }, 10);
  };

  // Handle opening delete dialog
  const handleConfirmDelete = (client: Client) => {
    selectClient(client);
    // Add a slight delay to ensure client data is set before dialog opens
    setTimeout(() => {
      setOpenDeleteDialog(true);
    }, 10);
  };

  const handleViewDocuments = (clientId: string) => {
    navigate(`/admin/clients/${clientId}/documents`);
  };

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'em_andamento').length;
  const pendingClients = clients.filter(client => client.status === 'documentacao').length;

  return (
    <MainLayout title="Clientes">
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8" style={{ color: '#053D38' }} />
                <div>
                  <h1 className="text-4xl font-bold" style={{ color: '#14140F' }}>
                    Clientes
                  </h1>
                  <p className="text-lg" style={{ color: '#34675C' }}>
                    Gerenciamento completo de clientes do escritório
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#34675C' }} />
                <Input
                  placeholder="Buscar cliente por nome, email ou telefone..."
                  className="pl-10 h-11 border-gray-200 shadow-sm"
                  style={{ 
                    borderColor: '#e5e7eb'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#053D38';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 1px #053D38';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setOpenNewDialog(true)}
                className="h-11 px-6 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                style={{
                  backgroundColor: '#053D38'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#34675C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#053D38';
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-3xl font-bold" style={{ color: '#14140F' }}>{totalClients}</p>
                  </div>
                  <Users className="h-6 w-6" style={{ color: '#053D38' }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                    <p className="text-3xl font-bold" style={{ color: '#14140F' }}>{activeClients}</p>
                  </div>
                  <Clock className="h-6 w-6" style={{ color: '#F26800' }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documentação</p>
                    <p className="text-3xl font-bold" style={{ color: '#14140F' }}>{pendingClients}</p>
                  </div>
                  <FileText className="h-6 w-6" style={{ color: '#34675C' }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="pb-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-semibold" style={{ color: '#14140F' }}>
                  Lista de Clientes
                </CardTitle>
                <div className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: '#34675C' }}>
                  <span>{clients.length} clientes</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <ClientsTable 
                  clients={clients} 
                  isLoading={isLoading} 
                  searchTerm={searchTerm}
                  onEdit={handleEditClient}
                  onDelete={handleConfirmDelete}
                  onViewDocuments={handleViewDocuments}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CreateClientModal 
        open={openNewDialog}
        onOpenChange={setOpenNewDialog}
        onSubmit={handleCreateClient}
        isSubmitting={isSubmitting}
      />

      <EditClientModal 
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        client={selectedClient}
        onSubmit={handleUpdateClient}
        isSubmitting={isSubmitting}
      />

      <DeleteClientModal 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        client={selectedClient}
        onConfirm={handleDeleteClient}
        isSubmitting={isSubmitting}
      />
    </MainLayout>
  );
};

export default Clients;
