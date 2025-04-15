
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ChartPie } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Colors for charts
const PROCESS_TYPE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const PROCESS_STATUS_COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff8042"];

const VisualizationSection = () => {
  const [processTypeData, setProcessTypeData] = useState<{ name: string; value: number }[]>([]);
  const [processStatusData, setProcessStatusData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Fetch clients for process type distribution
        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .select("process_type");
        
        if (clientsError) throw clientsError;
        
        // Count process types
        const processTypeCounts: Record<string, number> = {};
        clients?.forEach(client => {
          const processType = client.process_type || "Not Assigned";
          processTypeCounts[processType] = (processTypeCounts[processType] || 0) + 1;
        });
        
        // Format data for chart
        const formattedProcessTypeData = Object.entries(processTypeCounts)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0);
        
        setProcessTypeData(formattedProcessTypeData);
        
        // Fetch clients for status distribution
        const { data: statusClients, error: statusError } = await supabase
          .from("clients")
          .select("status");
        
        if (statusError) throw statusError;
        
        // Count statuses
        const statusCounts: Record<string, number> = {};
        statusClients?.forEach(client => {
          const status = client.status || "Unknown";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Format data for chart
        const formattedStatusData = Object.entries(statusCounts)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0);
        
        setProcessStatusData(formattedStatusData);
        
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChartData();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Visualizações</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Process Type Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ChartPie className="mr-2 h-5 w-5 text-primary" />
              Distribuição por Tipo de Processo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              ) : processTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados para exibir</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {processTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PROCESS_TYPE_COLORS[index % PROCESS_TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value}`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Process Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ChartPie className="mr-2 h-5 w-5 text-primary" />
              Status dos Processos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              ) : processStatusData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados para exibir</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {processStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PROCESS_STATUS_COLORS[index % PROCESS_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value}`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualizationSection;
