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
import { Client } from "@/services/clients/types";
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
          color: "rgba(255,255,255,0.8)", 
          bgColor: "#053D38",
          icon: <FileText className="h-3 w-3 mr-1" /> 
        };
      case "em_andamento":
        return { 
          label: "Em Andamento", 
          color: "text-white", 
          bgColor: "#F26800",
          icon: <Clock className="h-3 w-3 mr-1" /> 
        };
      case "concluido":
        return { 
          label: "Concluído", 
          color: "#14140F", 
          bgColor: "#A3CCAB",
          icon: <CheckCircle className="h-3 w-3 mr-1" /> 
        };
      default:
        return { 
          label: status, 
          color: "text-gray-700", 
          bgColor: "#f3f4f6",
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
        <TableRow style={{ backgroundColor: '#f8fafc' }} className="hover:bg-gray-50">
          <TableHead className="font-semibold text-gray-900">Nome</TableHead>
          <TableHead className="font-semibold text-gray-900">Email</TableHead>
          <TableHead className="font-semibold text-gray-900">Telefone</TableHead>
          <TableHead className="font-semibold text-gray-900">Tipo de Processo</TableHead>
          <TableHead className="font-semibold text-gray-900">Status</TableHead>
          <TableHead className="text-right font-semibold text-gray-900">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredClients.map((client, index) => {
          const statusDetails = getStatusDetails(client.status);
          
          return (
            <TableRow 
              key={client.id}
              className={`
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                hover:bg-[#F5F1EB] transition-colors duration-200
              `}
            >
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone || "-"}</TableCell>
              <TableCell>{client.process_type || "-"}</TableCell>
              <TableCell>
                <div 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: statusDetails.bgColor,
                    color: statusDetails.color
                  }}
                >
                  {statusDetails.icon}
                  {statusDetails.label}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 p-0 hover:bg-[#F5F1EB] hover:text-[#053D38] transition-colors duration-200"
                    >
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="w-48 bg-white border border-[#E5D5C8] shadow-lg"
                  >
                    <DropdownMenuItem 
                      onClick={() => onEdit(client)}
                      className="hover:bg-[#F5F1EB] hover:text-[#053D38] focus:bg-[#F5F1EB] focus:text-[#053D38] transition-colors duration-150"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onViewDocuments(client.id)}
                      className="hover:bg-[#F5F1EB] hover:text-[#053D38] focus:bg-[#F5F1EB] focus:text-[#053D38] transition-colors duration-150"
                    >
                      <File className="mr-2 h-4 w-4" />
                      Documentos
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(client)} 
                      className="text-red-600 hover:bg-[#FFEBEE] hover:text-red-700 focus:bg-[#FFEBEE] focus:text-red-700 transition-colors duration-150"
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
