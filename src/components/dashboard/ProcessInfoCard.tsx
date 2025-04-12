
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, User, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProcessInfoCardProps {
  processType?: string;
  status?: string;
  startDate?: string;
  responsibleAgent?: string;
  lastUpdate?: string;
}

const ProcessInfoCard = ({ 
  processType, 
  status,
  startDate,
  responsibleAgent,
  lastUpdate
}: ProcessInfoCardProps) => {
  
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap: Record<string, { color: string, label: string }> = {
      'active': { color: 'bg-green-100 text-green-700', label: 'Ativo' },
      'pending': { color: 'bg-yellow-100 text-yellow-700', label: 'Pendente' },
      'review': { color: 'bg-yellow-100 text-yellow-700', label: 'Em Análise' },
      'approved': { color: 'bg-blue-100 text-blue-700', label: 'Aprovado' },
      'denied': { color: 'bg-red-100 text-red-700', label: 'Negado' },
      'rfe': { color: 'bg-orange-100 text-orange-700', label: 'RFE' },
      'inactive': { color: 'bg-gray-100 text-gray-700', label: 'Inativo' },
    };

    const { color, label } = statusMap[status] || statusMap.inactive;
    
    return (
      <Badge className={`${color} hover:${color}`}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-primary" />
              Informações do Processo
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processType ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Tipo de Processo</span>
                  <span className="font-medium">{processType}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(status)}
                </div>

                {startDate && (
                  <div className="flex items-start gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Iniciado em</span>
                      <span className="font-medium">{formatDate(startDate)}</span>
                    </div>
                  </div>
                )}

                {responsibleAgent && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Advogado Responsável</span>
                      <span className="font-medium">{responsibleAgent}</span>
                    </div>
                  </div>
                )}

                {lastUpdate && (
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t mt-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Última atualização</span>
                      <span className="font-medium">{formatDate(lastUpdate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">
                Nenhuma informação de processo disponível no momento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="font-medium flex items-center gap-1 text-blue-700">
            🔔 Receba atualizações automáticas sobre o status do seu processo USCIS
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Baixe um aplicativo gratuito como <span className="font-medium">Case Tracker for USCIS & NVC</span> ou <span className="font-medium">MigraConnect Case Tracker</span>. Insira seu número de recibo e receba alertas em tempo real no seu celular.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <a 
            href="https://apps.apple.com/us/app/case-tracker-for-uscis/id921827126" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-black text-white text-xs px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.019-1.153-.231-1.725-.753-.367-.32-.826-.87-1.377-1.648-.59-.829-1.075-1.794-1.455-2.891-.407-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 0 0 1.315.863c-.106.307-.218.6-.336.882zM15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.541-2.941 1.452a2.955 2.955 0 0 1-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.435.013.128.019.255.019.381z"></path>
            </svg>
            App Store
          </a>
          <a 
            href="https://play.google.com/store/search?q=uscis+case+tracker&c=apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-black text-white text-xs px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.627a1 1 0 0 1 0 1.743l-2.808 1.628-2.492-2.492 2.493-2.506zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"></path>
            </svg>
            Play Store
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProcessInfoCard;
