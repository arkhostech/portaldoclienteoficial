
import { format } from "date-fns";
import { MoreHorizontal, Mail, CircleCheck, CircleX } from "lucide-react";
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Cliente</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="w-[100px]">Status</TableHead>
          <TableHead className="w-[150px]">Data Criação</TableHead>
          <TableHead className="w-[100px] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
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
              <div className="flex items-center gap-2">
                {client.status === "active" ? (
                  <CircleCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-500" />
                )}
                <span className="capitalize">{client.status}</span>
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
        ))}
      </TableBody>
    </Table>
  );
};

export default ProcessList;
