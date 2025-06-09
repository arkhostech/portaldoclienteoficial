import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, User, Phone, Mail, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientData } from "@/hooks/useClientData";
import { Link } from "react-router-dom";

interface ClientWelcomeSectionProps {
  clientData: ClientData | null;
  isLoading: boolean;
}

const ClientWelcomeSection = ({ clientData, isLoading }: ClientWelcomeSectionProps) => {

  if (isLoading) {
    return (
      <Card className="bg-white border border-[#f3f4f6] shadow-sm">
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
      <Card className="bg-white border border-[#f3f4f6] shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#1f2937] mb-2">
              Dados não encontrados
            </h2>
            <p className="text-[#6b7280]">
              Não foi possível carregar seus dados. Entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const memberSince = new Date(clientData.created_at).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <Card className="bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6 lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#000000] mb-1">
                Olá, {clientData.full_name.split(' ')[0]}! 👋
              </h2>
              <p className="text-[#6b7280] text-sm lg:text-base">
                Bem-vindo de volta ao seu portal Legacy Imigra
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-[#6b7280]" />
                  <span className="text-[#000000]">{clientData.email}</span>
                </div>
                {clientData.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-[#6b7280]" />
                    <span className="text-[#000000]">{clientData.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-[#6b7280]" />
                  <span className="text-[#000000]">
                    {clientData.process_type_name || "Processo não definido"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-[#6b7280]" />
                  <span className="text-[#000000]">Cliente desde {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <Link to="/chat">
              <Button className="flex-1 lg:flex-none bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-sm hover:shadow-md transition-all duration-200">
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