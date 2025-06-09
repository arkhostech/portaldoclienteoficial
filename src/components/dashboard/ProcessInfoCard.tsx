
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ProcessTracker from "./ProcessTracker";
import { ClientData } from "@/hooks/useClientData";

interface ProcessInfoCardProps {
  clientData: ClientData | null;
  isLoading: boolean;
}

const ProcessInfoCard = ({ clientData, isLoading }: ProcessInfoCardProps) => {
  if (isLoading) {
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const processType = clientData?.process_type_name || "Não definido";
  const status = clientData?.status || "documentacao";
  const memberSince = clientData?.created_at 
    ? new Date(clientData.created_at).toLocaleDateString('pt-BR')
    : "--";

  return (
    <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle>
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-primary" />
            Informações do Processo
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-3">Informações do Serviço</h3>
                
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground">Área</span>
                    <span className="font-medium">Imigração</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground">Tipo de Processo</span>
                    <span className="font-medium">{processType}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground">Cliente desde</span>
                    <span className="font-medium">{memberSince}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-muted-foreground">Responsável</span>
                    <div className="flex items-center mt-1">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage 
                          src="/images/avatar.png" 
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

            <div className="space-y-1">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-2">Status do Processo</span>
                <div className="w-full overflow-x-auto pb-1">
                  <ProcessTracker 
                    currentStatus={status} 
                    className="sm:flex-row" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessInfoCard;
