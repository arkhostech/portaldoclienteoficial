import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, ArrowRight } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="p-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Clientes
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Gerenciamento completo de clientes do escritório
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente por nome, email ou telefone..."
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setOpenNewDialog(true)}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                    <p className="text-3xl font-bold text-gray-900">{activeClients}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documentação</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingClients}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    Lista de Clientes
                  </CardTitle>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    <span>{clients.length} clientes</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Voltar ao Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
        client={selectedClient}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        onSubmit={handleUpdateClient}
        isSubmitting={isSubmitting}
      />

      <DeleteClientModal
        client={selectedClient}
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDeleteClient}
        isSubmitting={isSubmitting}
      />
    </MainLayout>
  );
};

export default Clients;
