
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Bem-vindo(a) ao Portal Legacy</AlertTitle>
            <AlertDescription>
              Aqui você pode acompanhar seu processo e gerenciar seus documentos.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status do Processo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                <span>Em andamento</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documentos Recentes</CardTitle>
            <CardDescription>
              Documentos enviados nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nenhum documento recente encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
