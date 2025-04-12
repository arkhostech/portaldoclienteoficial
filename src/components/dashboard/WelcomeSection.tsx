
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare } from "lucide-react";

interface WelcomeSectionProps {
  clientName: string;
}

const WelcomeSection = ({ clientName }: WelcomeSectionProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
      <div>
        <h2 className="text-3xl font-bold">Olá, {clientName || 'Cliente'}!</h2>
        <p className="text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Ver Relatórios
        </Button>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Contatar Advogado
        </Button>
      </div>
    </div>
  );
};

export default WelcomeSection;
