
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Client } from "@/services/clients/types";
import { useNavigate } from "react-router-dom";

interface ClientDocumentsHeaderProps {
  client: Client | null;
  isLoading: boolean;
  pageTitle: string;
}

export function ClientDocumentsHeader({
  client,
  isLoading,
  pageTitle
}: ClientDocumentsHeaderProps) {
  const navigate = useNavigate();
  
  const handleBackToClients = () => {
    navigate("/admin/clients");
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleBackToClients}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        {!isLoading && client && (
          <div className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">Email:</span> {client.email} | 
            <span className="font-medium ml-2">Processo:</span> {client.process_type || "Não definido"} |
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${client.status === "concluido" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
              {client.status === "documentacao" ? "Documentação" : 
               client.status === "em_andamento" ? "Em Andamento" : 
               client.status === "concluido" ? "Concluído" : "Status Desconhecido"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
