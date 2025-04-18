
import { FileText, ArrowsUpFromLine, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessStatusChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  'Documentação': {
    color: '#006494',
    icon: FileText,
    bgClass: 'bg-[#006494]',
    textColorClass: 'text-white',
    dbValue: 'documentacao'
  },
  'Em Andamento': {
    color: '#e8c064',
    icon: ArrowsUpFromLine,
    bgClass: 'bg-[#e8c064]',
    textColorClass: 'text-black',
    dbValue: 'em_andamento'
  },
  'Concluído': {
    color: '#5B8C5A',
    icon: CheckCircle,
    bgClass: 'bg-[#5B8C5A]',
    textColorClass: 'text-white',
    dbValue: 'concluido'
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
        <CardTitle className="text-lg">Status dos Processos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Sem dados para exibir</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
              {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
                const count = getStatusCount(statusKey);
                const Icon = config.icon;
                
                return (
                  <div
                    key={statusKey}
                    className={`${config.bgClass} ${config.textColorClass} rounded-xl p-6 shadow-md flex flex-col items-center justify-center text-center`}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
