
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
    bgClass: 'bg-[#006494]'
  },
  'Em Andamento': {
    color: '#e8c064',
    icon: ArrowsUpFromLine,
    bgClass: 'bg-[#e8c064]'
  },
  'Concluído': {
    color: '#5B8C5A',
    icon: CheckCircle,
    bgClass: 'bg-[#5B8C5A]'
  }
};

export const ProcessStatusChart = ({ data, isLoading }: ProcessStatusChartProps) => {
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
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const statusData = data.find(item => item.name === status);
              const Icon = config.icon;
              
              return (
                <div
                  key={status}
                  className={`${config.bgClass} rounded-xl p-4 shadow-md text-white`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-bold">{status}</h3>
                      <p>{statusData?.value || 0} clients</p>
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
