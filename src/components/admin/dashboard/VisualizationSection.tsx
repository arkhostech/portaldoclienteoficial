
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { BarChart3, ChartPie, LineChart } from "lucide-react";

// Sample data for process types chart
const processTypeData = [
  { name: "EB3", value: 35 },
  { name: "L1", value: 25 },
  { name: "Asylum", value: 20 },
  { name: "B1/B2", value: 10 },
  { name: "Other", value: 10 },
];

// Sample data for process status chart
const processStatusData = [
  { name: "Active", value: 65 },
  { name: "Waiting", value: 20 },
  { name: "Completed", value: 15 },
];

// Sample data for monthly payments
const monthlyPaymentsData = [
  { week: "Semana 1", value: 5400 },
  { week: "Semana 2", value: 7800 },
  { week: "Semana 3", value: 3200 },
  { week: "Semana 4", value: 16050 },
];

// Colors for charts
const PROCESS_TYPE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const PROCESS_STATUS_COLORS = ["#82ca9d", "#8884d8", "#ffc658"];
const PAYMENT_COLORS = ["#8884d8"];

const VisualizationSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Visualizações</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  <Tooltip formatter={(value) => [`${value}`, 'Quantidade']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                  <Tooltip formatter={(value) => [`${value}`, 'Quantidade']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Payments */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              Pagamentos por Semana (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPaymentsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis 
                    tickFormatter={(value) => 
                      `R$${value.toLocaleString('pt-BR')}`
                    } 
                  />
                  <Tooltip 
                    formatter={(value) => 
                      [`R$${value.toLocaleString('pt-BR')}`, 'Valor']
                    } 
                  />
                  <Bar dataKey="value" name="Valor" fill={PAYMENT_COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualizationSection;
