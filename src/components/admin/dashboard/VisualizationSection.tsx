import { ProcessTypeChart } from "./charts/ProcessTypeChart";
import { ProcessStatusChart } from "./charts/ProcessStatusChart";
import { useChartData } from "./hooks/useChartData";
import { BarChart3, PieChart } from "lucide-react";

const VisualizationSection = () => {
  const { processTypeData, processStatusData, isLoading } = useChartData();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-5 w-5" style={{ color: '#053D38' }} />
        <div>
          <h3 className="text-2xl font-bold" style={{ color: '#14140F' }}>
            Análise de Dados
          </h3>
          <p className="text-gray-600 text-sm">Visualizações em tempo real dos seus processos</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="h-4 w-4" style={{ color: '#053D38' }} />
            <h4 className="text-lg font-semibold" style={{ color: '#14140F' }}>Tipos de Processo</h4>
          </div>
          <ProcessTypeChart data={processTypeData} isLoading={isLoading} />
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-4 w-4" style={{ color: '#053D38' }} />
            <h4 className="text-lg font-semibold" style={{ color: '#14140F' }}>Status dos Processos</h4>
          </div>
          <ProcessStatusChart data={processStatusData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default VisualizationSection;
