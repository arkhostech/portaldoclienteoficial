import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
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
        
        // Fetch active processes (all processes except concluded ones)
        const { data: processes, error: processesError } = await supabase
          .from("clients")
          .select("id, process_type_id, status")
          .not("process_type_id", "is", null)
          .neq("status", "concluido");
        
        if (processesError) throw processesError;
        
        // Get processes awaiting documentation (status = "documentacao")
        const awaitingProcesses = processes?.filter(
          process => process.status === "documentacao"
        ) || [];
        
        setStats({
          clients: {
            total: clients?.length || 0,
            growth: newClients.length || 0,
            trend: "up",
          },
          processes: {
            total: processes?.length || 0,
            awaiting: awaitingProcesses.length || 0,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Clients */}
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-900/70 uppercase tracking-wide">
                  Total de Clientes
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                  {isLoading ? (
                    <div className="h-10 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  ) : (
                    stats.clients.total
                  )}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stats.clients.trend === "up"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {stats.clients.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>
                      {isLoading ? "..." : `+${stats.clients.growth}`} esta semana
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Processes */}
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-amber-900/70 uppercase tracking-wide">
                  Processos Ativos
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                  {isLoading ? (
                    <div className="h-10 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  ) : (
                    stats.processes.total
                  )}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>
                      {isLoading ? "..." : stats.processes.awaiting} aguardando documentação
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardSummary;
