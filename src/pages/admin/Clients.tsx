
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Filter, 
  Pencil, 
  Trash2,
  File,
  X,
  Loader2
} from "lucide-react";
import { fetchClients, createClient, updateClient, deleteClient, ClientFormData, Client } from "@/services/clientService";

const clientFormSchema = z.object({
  full_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string().default("active")
});

const Clients = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newClientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      status: "active"
    }
  });

  const editClientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      status: "active"
    }
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    
    loadClients();
  }, [isAdmin, navigate]);

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
        setOpenNewDialog(false);
        newClientForm.reset();
        toast.success("Cliente criado com sucesso");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Erro ao criar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    editClientForm.reset({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
      status: client.status
    });
    setOpenEditDialog(true);
  };

  const handleUpdateClient = async (data: ClientFormData) => {
    if (!selectedClient) return;
    
    try {
      setIsSubmitting(true);
      const result = await updateClient(selectedClient.id, data);
      if (result) {
        setClients(clients.map(c => c.id === result.id ? result : c));
        toast.success("Cliente atualizado com sucesso");
        setTimeout(() => {
          setOpenEditDialog(false);
          setSelectedClient(null);
        }, 300);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = (client: Client) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      setIsSubmitting(true);
      const success = await deleteClient(selectedClient.id);
      if (success) {
        setClients(clients.filter(c => c.id !== selectedClient.id));
        toast.success("Cliente excluído com sucesso");
        setTimeout(() => {
          setOpenDeleteDialog(false);
          setSelectedClient(null);
        }, 300);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocuments = (clientId: string) => {
    navigate(`/admin/clients/${clientId}/documents`);
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  // Handle dialog close properly
  const handleEditDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setOpenEditDialog(false);
      setTimeout(() => {
        setSelectedClient(null);
      }, 300);
    }
  };

  const handleDeleteDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setOpenDeleteDialog(false);
      setTimeout(() => {
        setSelectedClient(null);
      }, 300);
    }
  };

  const handleNewDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setOpenNewDialog(false);
    }
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
            <Dialog open={openNewDialog} onOpenChange={handleNewDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para cadastrar um novo cliente
                  </DialogDescription>
                </DialogHeader>
                <Form {...newClientForm}>
                  <form onSubmit={newClientForm.handleSubmit(handleCreateClient)} className="space-y-4">
                    <FormField
                      control={newClientForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome Completo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newClientForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="email@exemplo.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newClientForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(XX) XXXXX-XXXX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newClientForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Endereço completo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpenNewDialog(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Salvar
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          client.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {client.status === "active" ? "Ativo" : "Inativo"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDocuments(client.id)}>
                              <File className="mr-2 h-4 w-4" />
                              Documentos
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleConfirmDelete(client)} 
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={openEditDialog} onOpenChange={handleEditDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente
            </DialogDescription>
          </DialogHeader>
          <Form {...editClientForm}>
            <form onSubmit={editClientForm.handleSubmit(handleUpdateClient)} className="space-y-4">
              <FormField
                control={editClientForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome Completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editClientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@exemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editClientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(XX) XXXXX-XXXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editClientForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Endereço completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editClientForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                        {...field}
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleEditDialogClose(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Atualizar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onOpenChange={handleDeleteDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
              {selectedClient && ` "${selectedClient.full_name}"`} e todos os seus documentos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleDeleteDialogClose(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteClient}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Clients;
