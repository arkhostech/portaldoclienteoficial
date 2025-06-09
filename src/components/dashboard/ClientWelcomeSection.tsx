import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Phone, Mail, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientData } from "@/hooks/useClientData";
import { Link } from "react-router-dom";

interface ClientWelcomeSectionProps {
  clientData: ClientData | null;
  isLoading: boolean;
}

const ClientWelcomeSection = ({ clientData, isLoading }: ClientWelcomeSectionProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "documentacao":
        return { 
          label: "Documentação", 
          variant: "outline" as const, 
          bgColor: "bg-blue-50 text-blue-700 border-blue-200" 
        };
      case "em_andamento":
        return { 
          label: "Em Andamento", 
          variant: "secondary" as const, 
          bgColor: "bg-yellow-50 text-yellow-700 border-yellow-200" 
        };
      case "concluido":
        return { 
          label: "Concluído", 
          variant: "default" as const, 
          bgColor: "bg-green-50 text-green-700 border-green-200" 
        };
      default:
        return { 
          label: status, 
          variant: "outline" as const, 
          bgColor: "bg-gray-50 text-gray-700 border-gray-200" 
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6 lg:items-center lg:justify-between">
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientData) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Dados não encontrados
            </h2>
            <p className="text-red-600">
              Não foi possível carregar seus dados. Entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getStatusConfig(clientData.status);
  const memberSince = new Date(clientData.created_at).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6 lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Olá, {clientData.full_name.split(' ')[0]}! 👋
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
                  Bem-vindo de volta ao seu portal Legacy Imigra
                </p>
              </div>
              <Badge className={`${statusConfig.bgColor} border`}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{clientData.email}</span>
                </div>
                {clientData.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{clientData.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {clientData.process_type_name || "Processo não definido"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Cliente desde {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <Link to="/chat">
              <Button className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Contatar Escritório</span>
                <span className="sm:hidden">Contatar</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientWelcomeSection; 