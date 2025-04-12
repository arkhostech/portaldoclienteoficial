
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Users, FileText, Settings, BarChart, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <MainLayout title="Painel Administrativo">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Painel Administrativo</h2>
            <p className="text-muted-foreground">
              Bem-vindo ao painel de administração
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button>
              <BarChart className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/clients')}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-brand-600" />
                Gerenciar Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Visualize, adicione e edite clientes no sistema.
              </p>
              <Button variant="outline" className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/cases')}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-brand-600" />
                Gerenciar Processos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Visualize e atualize o status dos processos ativos.
              </p>
              <Button variant="outline" className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/documents')}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-brand-600" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Gerencie documentos dos clientes.
              </p>
              <Button variant="outline" className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/admin/payments')}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-brand-600" />
                Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Agende e gerencie pagamentos dos clientes.
              </p>
              <Button variant="outline" className="w-full">
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total de Clientes</span>
                <span className="text-2xl font-bold">27</span>
                <span className="text-xs text-green-600">+3 novos esta semana</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Processos Ativos</span>
                <span className="text-2xl font-bold">42</span>
                <span className="text-xs text-amber-600">5 aguardando aprovação</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Mensagens Não Lidas</span>
                <span className="text-2xl font-bold">8</span>
                <span className="text-xs text-red-600">3 prioritárias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
