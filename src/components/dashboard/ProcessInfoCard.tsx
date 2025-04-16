
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, User, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ProcessTracker from "./ProcessTracker";

interface ProcessInfoCardProps {
  processType?: string;
  status?: string;
  startDate?: string;
  responsibleAgent?: string;
  lastUpdate?: string;
}

const ProcessInfoCard = ({ 
  processType, 
  status = "documentacao",
  startDate,
  responsibleAgent,
  lastUpdate
}: ProcessInfoCardProps) => {
  return (
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Tipo de Processo</span>
                  <span className="font-medium">{processType}</span>
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
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="w-full max-w-full overflow-hidden">
                    <ProcessTracker 
                      currentStatus={status as "documentacao" | "em_andamento" | "concluido"} 
                      className="sm:flex-row" 
                    />
                  </div>
                </div>

                {lastUpdate && (
                  <div className="flex flex-col border-t pt-4">
                    <span className="text-sm text-muted-foreground">Última atualização</span>
                    <span className="font-medium">{formatDate(lastUpdate)}</span>
                  </div>
                )}
              </div>
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
  );
};

export default ProcessInfoCard;
