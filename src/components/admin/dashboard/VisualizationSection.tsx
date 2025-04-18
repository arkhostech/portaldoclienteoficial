
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { ChartPie } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Colors for process type chart
const PROCESS_TYPE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
// Colors for status chart
const PROCESS_STATUS_COLORS = {
  "Em Análise": "#006494",
  "Em Andamento": "#F5D547",
  "Concluído": "#5B8C5A"
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p>Quantidade: {payload[0].value}</p>
        <p>Percentual: {`${((payload[0].value / payload[0].payload.total) * 100).toFixed(0)}%`}</p>
      </div>
    );
  }
  return null;
};

const VisualizationSection = () => {
  const [processTypeData, setProcessTypeData] = useState<{ name: string; value: number, total: number }[]>([]);
  const [processStatusData, setProcessStatusData] = useState<{ name: string; value: number, total: number }[]>([]);
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
        
        // Count process types and calculate total
        const processTypeCounts: Record<string, number> = {};
        clients?.forEach(client => {
          const processType = client.process_type || "Não Atribuído";
          processTypeCounts[processType] = (processTypeCounts[processType] || 0) + 1;
        });
        
        const total = Object.values(processTypeCounts).reduce((acc, curr) => acc + curr, 0);
        
        // Format data for chart
        const formattedProcessTypeData = Object.entries(processTypeCounts)
          .map(([name, value]) => ({ name, value, total }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        
        setProcessTypeData(formattedProcessTypeData);
        
        // Fetch clients for status distribution
        const { data: statusClients, error: statusError } = await supabase
          .from("clients")
          .select("status");
        
        if (statusError) throw statusError;
        
        // Count statuses and calculate total
        const statusCounts: Record<string, number> = {};
        statusClients?.forEach(client => {
          const status = client.status || "Em Análise";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const statusTotal = Object.values(statusCounts).reduce((acc, curr) => acc + curr, 0);
        
        // Format data for chart
        const formattedStatusData = Object.entries(statusCounts)
          .map(([name, value]) => ({ name, value, total: statusTotal }))
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        
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
                  <BarChart
                    data={processTypeData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      bottom: 5,
                      left: 100,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      barSize={20}
                      radius={[0, 4, 4, 0]}
                    >
                      {processTypeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={PROCESS_TYPE_COLORS[index % PROCESS_TYPE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
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
                  <BarChart
                    data={processStatusData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      bottom: 5,
                      left: 100,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      barSize={20}
                      radius={[0, 4, 4, 0]}
                    >
                      {processStatusData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.name}`}
                          fill={PROCESS_STATUS_COLORS[entry.name as keyof typeof PROCESS_STATUS_COLORS] || "#8884d8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
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
