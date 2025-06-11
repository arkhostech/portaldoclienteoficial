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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Clients */}
      <Card 
        className="group transition-all duration-300 bg-white"
        style={{ 
          borderRadius: '8px',
          borderLeft: '4px solid #053D38',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        <CardContent style={{ padding: '16px' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" style={{ color: '#053D38' }} />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Total de Clientes
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: '#14140F' }}>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-gray-200 rounded-md animate-pulse"></div>
                  ) : (
                    stats.clients.total
                  )}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: '#A3CCAB',
                      color: '#14140F'
                    }}
                  >
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
      <Card 
        className="group transition-all duration-300 bg-white"
        style={{ 
          borderRadius: '8px',
          borderLeft: '4px solid #053D38',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        <CardContent style={{ padding: '16px' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" style={{ color: '#34675C' }} />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Processos Ativos
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold tracking-tight" style={{ color: '#14140F' }}>
                  {isLoading ? (
                    <div className="h-10 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  ) : (
                    stats.processes.total
                  )}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: '#F26800',
                      color: 'white'
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
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
