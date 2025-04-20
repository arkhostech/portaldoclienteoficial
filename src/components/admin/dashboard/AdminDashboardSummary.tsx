
import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboardSummary = () => {
  const [stats, setStats] = useState({
    clients: {
      total: 0,
      growth: 0,
      trend: "up" as "up" | "down",
    },
    processes: {
      total: 0,
      awaiting: 0,
    },
    payments: {
      count: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch total clients
        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .select("id, created_at");
        
        if (clientsError) throw clientsError;
        
        // Calculate clients added this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newClients = clients?.filter(
          client => new Date(client.created_at) > oneWeekAgo
        ) || [];
        
        // Fetch active processes (using clients with process_type_id as a proxy)
        const { data: processes, error: processesError } = await supabase
          .from("clients")
          .select("id, process_type_id, status")
          .not("process_type_id", "is", null);
        
        if (processesError) throw processesError;
        
        // Get pending processes (assuming "pending" is a status)
        const pendingProcesses = processes?.filter(
          process => process.status === "pending"
        ) || [];
        
        // Fetch payments for current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const { data: payments, error: paymentsError } = await supabase
          .from("scheduled_payments")
          .select("*")
          .gte("due_date", firstDayOfMonth.toISOString().split('T')[0])
          .lte("due_date", lastDayOfMonth.toISOString().split('T')[0]);
        
        if (paymentsError) throw paymentsError;
        
        setStats({
          clients: {
            total: clients?.length || 0,
            growth: newClients.length || 0,
            trend: "up",
          },
          processes: {
            total: processes?.length || 0,
            awaiting: pendingProcesses.length || 0,
          },
          payments: {
            count: payments?.length || 0,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {isLoading ? "..." : stats.clients.total}
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
                  <span>+{isLoading ? "..." : stats.clients.growth} esta semana</span>
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
                  {isLoading ? "..." : stats.processes.total}
                </h3>
                <span className="text-xs text-amber-600">
                  {isLoading ? "..." : stats.processes.awaiting} aguardando aprovação
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
                  {isLoading ? "..." : stats.payments.count}
                </h3>
              </div>
            </div>
            <div className="p-2 bg-green-500/10 rounded-full">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardSummary;
