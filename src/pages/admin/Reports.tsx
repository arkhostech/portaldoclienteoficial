
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Download, FileBar, PieChart as PieChartIcon } from "lucide-react";

// Dummy data for charts
const monthlyData = [
  { name: "Jan", processos: 4, clientes: 2 },
  { name: "Fev", processos: 6, clientes: 3 },
  { name: "Mar", processos: 8, clientes: 5 },
  { name: "Abr", processos: 10, clientes: 7 },
  { name: "Mai", processos: 9, clientes: 4 },
  { name: "Jun", processos: 12, clientes: 6 },
];

const processosPorTipoData = [
  { name: "Trabalhista", value: 35 },
  { name: "Civil", value: 25 },
  { name: "Família", value: 20 },
  { name: "Criminal", value: 10 },
  { name: "Tributário", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Reports = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mensal");

  // Redirect non-admin users
  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  return (
    <MainLayout title="Relatórios">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Relatórios</h2>
            <p className="text-muted-foreground">
              Análise de dados e estatísticas do escritório
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileBar className="mr-2 h-4 w-4" />
              Exportar dados
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Relatório completo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-4xl font-bold">27</span>
                <span className="ml-2 text-sm text-green-600">+12% mês</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Processos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-4xl font-bold">42</span>
                <span className="ml-2 text-sm text-amber-600">+5% mês</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-4xl font-bold">78%</span>
                <span className="ml-2 text-sm text-green-600">+3% mês</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-brand-600" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="processos" name="Processos" fill="#8884d8" />
                    <Bar dataKey="clientes" name="Novos Clientes" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5 text-brand-600" />
                Processos por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processosPorTipoData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {processosPorTipoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Advogado</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advogado</TableHead>
                  <TableHead>Processos</TableHead>
                  <TableHead>Concluídos</TableHead>
                  <TableHead>Taxa de Sucesso</TableHead>
                  <TableHead>Clientes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Dr. Roberto Almeida</TableCell>
                  <TableCell>15</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>80%</TableCell>
                  <TableCell>8</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dra. Carla Mendes</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>83%</TableCell>
                  <TableCell>7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dr. Paulo Santos</TableCell>
                  <TableCell>9</TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>67%</TableCell>
                  <TableCell>6</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dra. Juliana Costa</TableCell>
                  <TableCell>6</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>83%</TableCell>
                  <TableCell>5</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default Reports;
