import { FileText, ArrowsUpFromLine, CheckCircle } from 'lucide-react';
import { ChartLoadingState } from './shared/ChartLoadingState';
import { ChartEmptyState } from './shared/ChartEmptyState';

interface ProcessStatusChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  'Doc': {
    color: '#053D38',
    icon: FileText,
    bgClass: 'bg-[#053D38]',
    textColorClass: 'text-white',
    dbValue: 'documentacao',
    description: 'Clientes que ainda faltam documentações para início do processo'
  },
  'Em andam': {
    color: '#F26800',
    icon: ArrowsUpFromLine,
    bgClass: 'bg-[#F26800]',
    textColorClass: 'text-white',
    dbValue: 'em_andamento',
    description: 'Processos em Andamento'
  },
  'Concluído': {
    color: '#A3CCAB',
    icon: CheckCircle,
    bgClass: 'bg-[#A3CCAB]',
    textColorClass: 'text-white',
    dbValue: 'concluido',
    description: 'Processos finalizados'
  }
};

export const ProcessStatusChart = ({ data, isLoading }: ProcessStatusChartProps) => {
  const getStatusCount = (statusKey: string): number => {
    const config = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG];
    if (!config) return 0;
    
    const entry = data.find(item => item.name === config.dbValue);
    return entry?.value || 0;
  };

  return (
    <div className="space-y-4">
      <h5 className="text-base font-medium" style={{ color: '#14140F' }}>
        Status dos Processos
      </h5>
      {isLoading ? (
        <ChartLoadingState />
      ) : data.length === 0 ? (
        <ChartEmptyState />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">
            {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
              const count = getStatusCount(statusKey);
              const Icon = config.icon;
              
              return (
                <div
                  key={statusKey}
                  className={`${config.bgClass} ${config.textColorClass} rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-8 w-8 flex-shrink-0" />
                    <span className="font-bold text-lg whitespace-nowrap">{statusKey}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">{count}</div>
                    <div className="text-sm opacity-80 uppercase tracking-wider">clientes</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
              <div key={`legend-${statusKey}`} className="text-center px-2" style={{ color: '#34675C' }}>
                <p className="text-xs">{config.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
