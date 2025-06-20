
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

// Sample data - in a real app this would come from your backend
const processStatusData = [
  { status: "documentacao", label: "Documentação", value: 30 },
  { status: "em_andamento", label: "Em Andamento", value: 45 },
  { status: "concluido", label: "Concluído", value: 25 }
];

// Status colors
const STATUS_COLORS = {
  documentacao: "#006494",
  em_andamento: "#F5D547",
  concluido: "#5B8C5A"
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

const ProcessStatusChart = () => {
  // Calculate total for percentage
  const total = processStatusData.reduce((acc, item) => acc + item.value, 0);
  
  // Transform data for stacked bar chart
  const chartData = [
    {
      name: "Status",
      ...processStatusData.reduce((acc, item) => ({
        ...acc,
        [item.status]: item.value
      }), {})
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-brand-600" />
          Status dos Processos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              barSize={40}
            >
              <XAxis type="number" hide />
              <Tooltip content={<CustomTooltip />} />
              {processStatusData.map((status) => (
                <Bar
                  key={status.status}
                  dataKey={status.status}
                  stackId="status"
                  fill={STATUS_COLORS[status.status as keyof typeof STATUS_COLORS]}
                  label={{
                    position: 'inside',
                    content: (props) => {
                      const { x, y, width, value, height } = props;
                      // Ensure value is a number before performing arithmetic
                      const numericValue = typeof value === 'number' ? value : 0;
                      const percentage = ((numericValue / total) * 100).toFixed(0);
                      
                      // Ensure width is a number before comparison
                      const numericWidth = typeof width === 'number' ? width : 0;
                      if (numericWidth < 30) return null;
                      
                      // Ensure x, y, width, and height are numbers before arithmetic
                      const numericX = typeof x === 'number' ? x : 0;
                      const numericY = typeof y === 'number' ? y : 0;
                      const numericHeight = typeof height === 'number' ? height : 0;
                      
                      return (
                        <text
                          x={numericX + numericWidth / 2}
                          y={numericY + numericHeight / 2}
                          fill="#FFFFFF"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-medium"
                          fontSize="10"
                        >
                          {`${percentage}%`}
                        </text>
                      );
                    }
                  }}
                />
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
