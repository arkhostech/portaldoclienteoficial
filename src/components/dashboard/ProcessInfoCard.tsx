import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Building2, UserCheck, TrendingUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ProcessTracker from "./ProcessTracker";
import { ClientData } from "@/hooks/useClientData";

interface ProcessInfoCardProps {
  clientData: ClientData | null;
  isLoading: boolean;
}

const ProcessInfoCard = ({ clientData, isLoading }: ProcessInfoCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "documentacao":
        return { 
          label: "Documentação", 
          bgColor: "bg-[#dbeafe] text-[#1e3a8a] border-[#1e3a8a]",
          icon: FileCheck,
          iconColor: "text-[#1e3a8a]"
        };
      case "em_andamento":
        return { 
          label: "Em Andamento", 
          bgColor: "bg-[#dbeafe] text-[#3b82f6] border-[#3b82f6]",
          icon: TrendingUp,
          iconColor: "text-[#3b82f6]"
        };
      case "concluido":
        return { 
          label: "Concluído", 
          bgColor: "bg-[#dbeafe] text-[#1e3a8a] border-[#1e3a8a]",
          icon: UserCheck,
          iconColor: "text-[#1e3a8a]"
        };
      default:
        return { 
          label: status, 
          bgColor: "bg-[#f3f4f6] text-[#6b7280] border-[#f3f4f6]",
          icon: FileCheck,
          iconColor: "text-[#6b7280]"
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-[#f3f4f6] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const processType = clientData?.process_type_name || "Não definido";
  const status = clientData?.status || "documentacao";
  const statusConfig = getStatusConfig(status);

  return (
    <Card className="bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Header - Informações do Processo */}
          <div className="lg:col-span-1 flex items-center space-x-3">
            <div className="p-3 bg-[#dbeafe] rounded-lg group-hover:bg-[#93c5fd] transition-colors">
              <FileCheck className="h-6 w-6 text-[#1e3a8a]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-[#000000]">
                Informações do Processo
              </CardTitle>
              <p className="text-sm text-[#6b7280] mt-1">
                Acompanhe o progresso do seu processo
              </p>
            </div>
          </div>
          
          {/* Right Header - Status do Processo */}
          <div className="lg:col-span-2 flex items-center space-x-2">
            <statusConfig.icon className={`h-5 w-5 ${statusConfig.iconColor}`} />
            <span className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide">
              Status do Processo
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Process Details */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-[#f3f4f6] rounded-lg border border-[#f3f4f6] hover:bg-white hover:border-[#93c5fd] hover:shadow-sm transition-all">
              <div className="p-2 bg-[#dbeafe] rounded-lg">
                <Building2 className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Área</span>
                <p className="font-semibold text-[#000000] text-sm">Imigração</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#f3f4f6] rounded-lg border border-[#f3f4f6] hover:bg-white hover:border-[#93c5fd] hover:shadow-sm transition-all">
              <div className="p-2 bg-[#dbeafe] rounded-lg">
                <FileCheck className="h-5 w-5 text-[#1e3a8a]" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Tipo de Processo</span>
                <p className="font-semibold text-[#000000] text-sm">{processType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#f3f4f6] rounded-lg border border-[#f3f4f6] hover:bg-white hover:border-[#93c5fd] hover:shadow-sm transition-all">
              <div className="p-2 bg-[#f3f4f6] rounded-lg">
                <UserCheck className="h-5 w-5 text-[#6b7280]" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Responsável</span>
                <div className="flex items-center mt-1">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage 
                      src="/images/avatar.png" 
                      alt="Legacy Imigra" 
                      className="h-full w-full object-cover object-center"
                    />
                    <AvatarFallback className="text-xs">LI</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-[#000000] text-sm">Legacy Imigra</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status Tracker */}
          <div className="lg:col-span-2">
            <div className="bg-[#f3f4f6] rounded-lg p-4 border border-[#f3f4f6]">
              <div className="w-full overflow-x-auto">
                <ProcessTracker 
                  currentStatus={status} 
                  className="sm:flex-row" 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessInfoCard;
