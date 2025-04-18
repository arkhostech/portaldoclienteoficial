
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartPie, Palette } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";

const PROCESS_TYPE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface ProcessTypeChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

export const ProcessTypeChart = ({ data, isLoading }: ProcessTypeChartProps) => {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ChartPie className="mr-2 h-5 w-5 text-primary" />
            Distribuição por Tipo de Processo
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            {showLegend ? 'Ocultar Legenda' : 'Ver Legenda'}
          </Button>
        </div>
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
            <div className="relative h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={60}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={PROCESS_TYPE_COLORS[index % PROCESS_TYPE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {showLegend && (
                <div className="absolute top-0 right-0 bg-white/90 p-2 rounded-md shadow-sm border">
                  {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm mb-1">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: PROCESS_TYPE_COLORS[index % PROCESS_TYPE_COLORS.length] }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
