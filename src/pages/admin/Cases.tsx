
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { FilePlus, Search, MoreHorizontal, Filter } from "lucide-react";

// Dummy data - in a real application this would come from an API
const cases = [
  { 
    id: "P-20240001", 
    title: "Processo Trabalhista João Silva", 
    client: "João Silva", 
    type: "Trabalhista", 
    status: "Em andamento",
    updated: "12/04/2023" 
  },
  { 
    id: "P-20240002", 
    title: "Divórcio Maria Santos", 
    client: "Maria Santos", 
    type: "Família", 
    status: "Concluído",
    updated: "28/03/2023" 
  },
  { 
    id: "P-20240003", 
    title: "Indenização Ana Costa", 
    client: "Ana Costa", 
    type: "Civil", 
    status: "Em andamento",
    updated: "05/04/2023" 
  },
  { 
    id: "P-20240004", 
    title: "Recurso Tributário João Silva", 
    client: "João Silva", 
    type: "Tributário", 
    status: "Aguardando",
    updated: "02/04/2023" 
  },
  { 
    id: "P-20240005", 
    title: "Processo Criminal Carlos Pereira", 
    client: "Carlos Pereira", 
    type: "Criminal", 
    status: "Em andamento",
    updated: "10/04/2023" 
  },
];

const Cases = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Redirect non-admin users
  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "todos") {
      return matchesSearch;
    } else {
      return matchesSearch && caseItem.status === statusFilter;
    }
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Em andamento":
        return "bg-blue-100 text-blue-700";
      case "Concluído":
        return "bg-green-100 text-green-700";
      case "Aguardando":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <MainLayout title="Processos">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Processos</h2>
            <p className="text-muted-foreground">
              Gerenciamento de processos jurídicos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar processo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CardTitle className="pt-2">Lista de Processos</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por status:</span>
                <Select 
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Aguardando">Aguardando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-mono">{caseItem.id}</TableCell>
                    <TableCell className="font-medium">{caseItem.title}</TableCell>
                    <TableCell>{caseItem.client}</TableCell>
                    <TableCell>{caseItem.type}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        getStatusBadgeClass(caseItem.status)
                      }`}>
                        {caseItem.status}
                      </div>
                    </TableCell>
                    <TableCell>{caseItem.updated}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Cases;
