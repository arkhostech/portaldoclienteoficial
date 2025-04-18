import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartPie, Palette } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";
import { ChartLoadingState } from './shared/ChartLoadingState';
import { ChartEmptyState } from './shared/ChartEmptyState';
import { ChartContainer } from "./shared/ChartContainer";

const PROCESS_TYPE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface ProcessTypeChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

export const ProcessTypeChart = ({ data, isLoading }: ProcessTypeChartProps) => {
  const [showLegend, setShowLegend] = useState(false);

  const legendToggleButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowLegend(!showLegend)}
      className="flex items-center gap-2"
    >
      <Palette className="h-4 w-4" />
      {showLegend ? 'Ocultar Legenda' : 'Ver Legenda'}
    </Button>
  );

  return (
    <ChartContainer 
      title="Distribuição por Tipo de Processo"
      icon={ChartPie}
      action={legendToggleButton}
    >
      <div className="h-64">
        {isLoading ? (
          <ChartLoadingState />
        ) : data.length === 0 ? (
          <ChartEmptyState />
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
                  outerRadius={120} // Increased from 110
                  innerRadius={55}  // Increased from 50
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
    </ChartContainer>
  );
};
