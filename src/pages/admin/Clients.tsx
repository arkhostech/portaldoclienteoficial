
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
    selectClient 
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

  return (
    <MainLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Clientes</h2>
            <p className="text-muted-foreground">
              Gerenciamento de clientes do escritório
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setOpenNewDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ClientsTable 
              clients={clients} 
              isLoading={isLoading} 
              searchTerm={searchTerm}
              onEdit={handleEditClient}
              onDelete={handleConfirmDelete}
              onViewDocuments={handleViewDocuments}
            />
          </CardContent>
        </Card>
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
