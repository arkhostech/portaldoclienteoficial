
import { ProcessTypeChart } from "./charts/ProcessTypeChart";
import { ProcessStatusChart } from "./charts/ProcessStatusChart";
import { useChartData } from "./hooks/useChartData";

const VisualizationSection = () => {
  const { processTypeData, processStatusData, isLoading } = useChartData();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Visualizações</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProcessTypeChart data={processTypeData} isLoading={isLoading} />
        <ProcessStatusChart data={processStatusData} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default VisualizationSection;
