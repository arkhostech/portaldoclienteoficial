
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

// Data for process types
const processosPorTipoData = [
  { name: "EB-1", value: 35 },
  { name: "EB-2", value: 25 },
  { name: "Turista", value: 20 },
  { name: "Not Assigned", value: 10 },
  { name: "Estudante", value: 10 },
];

// Custom colors for each process type
const COLORS = {
  "EB-1": "#006494",
  "EB-2": "#5B8C5A",
  "Turista": "#F5D547",
  "Not Assigned": "#E86A33",
  "Estudante": "#3F88C5",
  // Fallback colors for any additional categories
  "Other": "#8884d8",
};

// Format numbers as percentages
const formatAsPercentage = (value: number) => {
  const sum = processosPorTipoData.reduce((acc, item) => acc + item.value, 0);
  const percentage = (value / sum) * 100;
  return `${percentage.toFixed(0)}%`;
};

// Custom tooltip content
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{data.name}</p>
        <p>{`Quantidade: ${data.value}`}</p>
        <p>{`Percentual: ${formatAsPercentage(data.value)}`}</p>
      </div>
    );
  }
  return null;
};

const ProcessTypeChart = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-brand-600" />
          Processos por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processosPorTipoData}
              layout="vertical"
              margin={{
                top: 5,
                right: 40, // Added more space on the right for percentage labels
                bottom: 5,
                left: 70, // Added more space on the left for category names
              }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#666', fontSize: 12 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                barSize={30} // Bar height
                radius={[0, 4, 4, 0]} // Slightly rounded corners on the right side
                label={{
                  position: 'right',
                  formatter: formatAsPercentage,
                  fill: '#666',
                  fontSize: 12,
                }}
              >
                {processosPorTipoData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessTypeChart;
