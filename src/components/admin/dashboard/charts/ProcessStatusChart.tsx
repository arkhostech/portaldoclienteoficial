
import { FileText, ArrowsUpFromLine, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProcessStatusChartProps {
  data: { name: string; value: number; total: number }[];
  isLoading: boolean;
}

// Map DB status values to display names and configurations
const STATUS_CONFIG = {
  'Documentação': {
    color: '#006494',
    icon: FileText,
    bgClass: 'bg-[#006494]',
    dbValue: 'documentacao' // DB value
  },
  'Em Andamento': {
    color: '#e8c064',
    icon: ArrowsUpFromLine,
    bgClass: 'bg-[#e8c064]',
    dbValue: 'em_andamento' // DB value
  },
  'Concluído': {
    color: '#5B8C5A',
    icon: CheckCircle,
    bgClass: 'bg-[#5B8C5A]',
    dbValue: 'concluido' // DB value
  }
};

export const ProcessStatusChart = ({ data, isLoading }: ProcessStatusChartProps) => {
  // Transform data to map DB values to display names
  const getStatusCount = (statusKey: string): number => {
    const config = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG];
    if (!config) return 0;
    
    // Find the entry in data where name matches the DB value
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
              const count = getStatusCount(statusKey);
              const Icon = config.icon;
              
              return (
                <div
                  key={statusKey}
                  className={`${config.bgClass} rounded-xl p-4 shadow-md text-white`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-bold">{statusKey}</h3>
                      <p>{count} clients</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
