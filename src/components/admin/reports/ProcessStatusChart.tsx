
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

// Sample data - in a real app this would come from your backend
const processStatusData = [
  { status: "documentacao", label: "Documentação", value: 30 },
  { status: "em_andamento", label: "Em Andamento", value: 45 },
  { status: "concluido", label: "Concluído", value: 25 },
  { status: "active", label: "Active", value: 10 }
];

// Status colors
const STATUS_COLORS = {
  documentacao: "#006494",
  em_andamento: "#F5D547",
  concluido: "#5B8C5A",
  active: "#FFA91F"
};

// Format numbers as percentages
const formatAsPercentage = (value: number) => {
  const total = processStatusData.reduce((acc, item) => acc + item.value, 0);
  return `${((value / total) * 100).toFixed(0)}%`;
};

// Custom tooltip content
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{data.label}</p>
        <p>{`${data.value} clientes`}</p>
        <p>{`${formatAsPercentage(data.value)}`}</p>
      </div>
    );
  }
  return null;
};

// Custom label for bar segments
const renderCustomLabel = (props: any) => {
  const { x, y, width, value, height } = props;
  const percentage = formatAsPercentage(value);
  
  // Only show label if segment is wide enough
  if (width < 50) return null;

  return (
    <text
      x={x + width/2}
      y={y + height/2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {percentage}
    </text>
  );
};

const ProcessStatusChart = () => {
  // Transform data for stacked bar chart
  const transformedData = [{
    name: "Status",
    ...processStatusData.reduce((acc, item) => ({
      ...acc,
      [item.status]: item.value
    }), {})
  }];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-brand-600" />
          Status dos Processos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 md:h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transformedData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                bottom: 5,
                left: 30
              }}
            >
              <XAxis type="number" hide />
              <Tooltip content={<CustomTooltip />} />
              {processStatusData.map((status) => (
                <Bar
                  key={status.status}
                  dataKey={status.status}
                  stackId="status"
                  fill={STATUS_COLORS[status.status as keyof typeof STATUS_COLORS]}
                  label={renderCustomLabel}
                >
                  {/* No additional cells needed for stacked bar segments */}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {processStatusData.map((status) => (
            <div key={status.status} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] }}
              />
              <span className="text-sm text-gray-600">
                {status.label} ({formatAsPercentage(status.value)})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessStatusChart;
