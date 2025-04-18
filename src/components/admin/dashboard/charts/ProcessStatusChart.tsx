
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPie } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";

const PROCESS_STATUS_COLORS = {
  "Em Análise": "#006494",
  "Em Andamento": "#F5D547",
  "Concluído": "#5B8C5A"
};

interface ProcessStatusChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

export const ProcessStatusChart = ({ data, isLoading }: ProcessStatusChartProps) => {
  return (
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
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Sem dados para exibir</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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
                  {data.map((entry) => (
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
  );
};
