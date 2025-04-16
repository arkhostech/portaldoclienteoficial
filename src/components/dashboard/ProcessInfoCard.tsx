
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
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
          <div className="space-y-4">
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
                            src="/lovable-uploads/d2fc1e07-1881-4ff2-a860-5dfae4df31e5.png" 
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

              <div className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="w-full overflow-x-auto">
                    <ProcessTracker 
                      currentStatus={status as "documentacao" | "em_andamento" | "concluido"} 
                      className="sm:flex-row" 
                    />
                  </div>
                </div>
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
