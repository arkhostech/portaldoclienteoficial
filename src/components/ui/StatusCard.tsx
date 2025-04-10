
import { cva } from 'class-variance-authority';
import { StatusType } from '@/utils/dummyData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, RotateCw } from 'lucide-react';

const statusVariants = cva("", {
  variants: {
    status: {
      'waiting': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'completed': 'bg-green-100 text-green-800 border-green-300',
    },
  },
  defaultVariants: {
    status: 'waiting',
  },
});

const statusIconMap = {
  'waiting': <Clock className="h-5 w-5" />,
  'in-progress': <RotateCw className="h-5 w-5" />,
  'completed': <CheckCircle className="h-5 w-5" />,
};

const statusTextMap = {
  'waiting': 'Aguardando',
  'in-progress': 'Em Andamento',
  'completed': 'Concluído',
};

interface StatusCardProps {
  title: string;
  status: StatusType;
  currentStep: string;
  nextSteps: string;
  lastUpdated: string;
}

const StatusCard = ({
  title,
  status,
  currentStep,
  nextSteps,
  lastUpdated,
}: StatusCardProps) => {
  const formattedDate = new Date(lastUpdated).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={statusVariants({ status })}>
            <span className="flex items-center gap-1">
              {statusIconMap[status]}
              {statusTextMap[status]}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Etapa Atual</h4>
            <p className="text-sm">{currentStep}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Próximos Passos</h4>
            <p className="text-sm">{nextSteps}</p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">Última atualização: {formattedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
