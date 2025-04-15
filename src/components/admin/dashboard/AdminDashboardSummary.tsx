
import {
  Users,
  FileText,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AdminDashboardSummary = () => {
  // In a real app, these values would come from API calls or context
  const stats = {
    clients: {
      total: 27,
      growth: 3,
      trend: "up", // "up" or "down"
    },
    processes: {
      total: 42,
      awaiting: 5,
    },
    payments: {
      count: 18,
      value: "R$ 32.450,00",
    },
    messages: {
      total: 8,
      priority: 3,
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Clients */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total de Clientes
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold tracking-tight">
                  {stats.clients.total}
                </h3>
                <div
                  className={`flex items-center text-xs ${
                    stats.clients.trend === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stats.clients.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  <span>+{stats.clients.growth} esta semana</span>
                </div>
              </div>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Processes */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Processos Ativos
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold tracking-tight">
                  {stats.processes.total}
                </h3>
                <span className="text-xs text-amber-600">
                  {stats.processes.awaiting} aguardando aprovação
                </span>
              </div>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payments */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Pagamentos este Mês
              </p>
              <div className="flex flex-col">
                <h3 className="text-3xl font-bold tracking-tight">
                  {stats.payments.count}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Total: {stats.payments.value}
                </span>
              </div>
            </div>
            <div className="p-2 bg-green-500/10 rounded-full">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unread Messages */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Mensagens Não Lidas
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold tracking-tight">
                  {stats.messages.total}
                </h3>
                <span className="flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {stats.messages.priority} prioritárias
                </span>
              </div>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardSummary;
