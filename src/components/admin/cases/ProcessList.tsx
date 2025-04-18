
import { format } from "date-fns";
import { MoreHorizontal, Mail, FileText, Clock, CheckCircle } from "lucide-react";
import { Client } from "@/services/clients/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProcessListProps {
  clients: Client[];
}

const ProcessList = ({ clients }: ProcessListProps) => {
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "documentacao":
        return { 
          label: "Documentação", 
          color: "bg-[#006494] text-white", 
          icon: <FileText className="h-3 w-3 mr-1" /> 
        };
      case "em_andamento":
        return { 
          label: "Em Andamento", 
          color: "bg-[#F5D547] text-black", 
          icon: <Clock className="h-3 w-3 mr-1" /> 
        };
      case "concluido":
        return { 
          label: "Concluído", 
          color: "bg-[#5B8C5A] text-white", 
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Cliente</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="w-[150px]">Status</TableHead>
          <TableHead className="w-[150px]">Data Criação</TableHead>
          <TableHead className="w-[100px] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const statusDetails = getStatusDetails(client.status);
          
          return (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {client.email}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusDetails.color}`}>
                  {statusDetails.icon}
                  {statusDetails.label}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(client.created_at), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Remover
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

export default ProcessList;
