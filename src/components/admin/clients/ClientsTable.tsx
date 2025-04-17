import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  File,
  Loader2,
  FileText,
  Clock,
  CheckCircle
} from "lucide-react";
import { Client } from "@/services/clientService";
import { processStatusOptions } from "./schemas/clientSchema";

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewDocuments: (clientId: string) => void;
}

const ClientsTable = ({
  clients,
  isLoading,
  searchTerm,
  onEdit,
  onDelete,
  onViewDocuments
}: ClientsTableProps) => {
  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.process_type && client.process_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "documentacao":
        return { 
          label: "Documentação", 
          color: "bg-[#E7C164] text-white", 
          icon: <FileText className="h-3 w-3 mr-1" /> 
        };
      case "em_andamento":
        return { 
          label: "Em Andamento", 
          color: "bg-[#EAD295] text-orange-700", 
          icon: <Clock className="h-3 w-3 mr-1" /> 
        };
      case "concluido":
        return { 
          label: "Concluído", 
          color: "bg-green-100 text-green-700", 
          icon: <CheckCircle className="h-3 w-3 mr-1" /> 
        };
      default:
        return { 
          label: status, 
          color: "bg-gray-100 text-gray-700", 
          icon: null 
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchTerm ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado."}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Tipo de Processo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredClients.map((client) => {
          const statusDetails = getStatusDetails(client.status);
          
          return (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone || "-"}</TableCell>
              <TableCell>{client.process_type || "-"}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusDetails.color}`}>
                  {statusDetails.icon}
                  {statusDetails.label}
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
                    <DropdownMenuItem onClick={() => onEdit(client)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewDocuments(client.id)}>
                      <File className="mr-2 h-4 w-4" />
                      Documentos
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(client)} 
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
