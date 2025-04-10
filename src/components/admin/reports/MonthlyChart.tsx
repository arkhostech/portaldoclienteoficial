
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";

// Monthly data for the chart
const monthlyData = [
  { name: "Jan", processos: 4, clientes: 2 },
  { name: "Fev", processos: 6, clientes: 3 },
  { name: "Mar", processos: 8, clientes: 5 },
  { name: "Abr", processos: 10, clientes: 7 },
  { name: "Mai", processos: 9, clientes: 4 },
  { name: "Jun", processos: 12, clientes: 6 },
];

const MonthlyChart = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BarChartIcon className="mr-2 h-5 w-5 text-brand-600" />
          Evolução Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="processos" name="Processos" fill="#8884d8" />
              <Bar dataKey="clientes" name="Novos Clientes" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;
