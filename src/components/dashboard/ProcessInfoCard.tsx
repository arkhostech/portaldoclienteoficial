
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, User, AlertCircle, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProcessTracker from "./ProcessTracker";

interface ProcessInfoCardProps {
  processType?: string;
  status?: string;
  startDate?: string;
  responsibleAgent?: string;
  lastUpdate?: string;
  area?: string;
}

const ProcessInfoCard = ({ 
  processType, 
  status = "documentacao",
  startDate,
  responsibleAgent,
  lastUpdate,
  area = "Imigração"
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
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold mb-3">Informações do Serviço</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Área</span>
                      <span className="font-medium">{area}</span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Processo</span>
                      <span className="font-medium">{processType}</span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Responsável</span>
                      <div className="flex items-center mt-1">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage 
                            src="https://cdn.tailgrids.com/2.2/assets/core-components/images/avatar/image-05.jpg" 
                            alt="Legacy Imigra" 
                            className="h-full w-full object-cover object-center"
                          />
                          <AvatarFallback>LI</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Legacy Imigra</span>
                      </div>
                    </div>
                  </div>
                </div>
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
