
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface WelcomeSectionProps {
  clientName: string;
}

const WelcomeSection = ({ clientName }: WelcomeSectionProps) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 gap-4 justify-between items-start">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
          Olá, {clientName || 'Cliente'}!
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto justify-end">
        <Button className="text-xs md:text-sm flex-1 sm:flex-none justify-center">
          <MessageSquare className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Contatar Escritório</span>
          <span className="sm:hidden">Contatar</span>
        </Button>
      </div>
    </div>
  );
};

export default WelcomeSection;
