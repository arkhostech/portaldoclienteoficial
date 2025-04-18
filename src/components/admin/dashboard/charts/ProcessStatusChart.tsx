import { FileText, ArrowsUpFromLine, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartLoadingState } from './shared/ChartLoadingState';
import { ChartEmptyState } from './shared/ChartEmptyState';

interface ProcessStatusChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  'Doc': {
    color: '#006494',
    icon: FileText,
    bgClass: 'bg-[#006494]',
    textColorClass: 'text-white',
    dbValue: 'documentacao',
    description: 'Clientes que ainda faltam documentações para início do processo'
  },
  'Em andam': {
    color: '#e8c064',
    icon: ArrowsUpFromLine,
    bgClass: 'bg-[#e8c064]',
    textColorClass: 'text-black',
    dbValue: 'em_andamento',
    description: 'Processos em Andamento'
  },
  'Concluído': {
    color: '#5B8C5A',
    icon: CheckCircle,
    bgClass: 'bg-[#5B8C5A]',
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate">Status dos Processos</CardTitle>
      </CardHeader>
      <CardContent>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
                <div key={`legend-${statusKey}`} className="text-center px-2">
                  <p className="text-xs">{config.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
