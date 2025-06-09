import { cn } from "@/lib/utils";
import ProcessStep from "./process/ProcessStep";

type ProcessStatus = "documentacao" | "em_andamento" | "concluido";

const steps = [
  { id: "documentacao", label: "Documentação", step: 1 },
  { id: "em_andamento", label: "Em Andamento", step: 2 },
  { id: "concluido", label: "Concluído", step: 3 },
] as const;

interface ProcessTrackerProps {
  currentStatus: ProcessStatus;
  className?: string;
}

const ProcessTracker = ({ currentStatus, className }: ProcessTrackerProps) => {
  const getStepStatus = (stepId: ProcessStatus) => {
    // Se o processo está concluído, todos os steps devem aparecer como completos
    if (currentStatus === "concluido") {
      return "complete";
    }
    
    // Lógica normal para outros status
    const statusIndex = steps.findIndex(s => s.id === currentStatus);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < statusIndex) return "complete";
    if (stepIndex === statusIndex) return "current";
    return "upcoming";
  };

  const getLineColor = (stepIndex: number) => {
    // Se o processo está concluído, todas as linhas devem ser azuis
    if (currentStatus === "concluido") {
      return "bg-[#3b82f6]";
    }
    
    // Linha entre step 1 e 2: azul se step 1 está completo
    if (stepIndex === 0) {
      const step1Status = getStepStatus("documentacao");
      return step1Status === "complete" ? "bg-[#3b82f6]" : "bg-[#e5e7eb]";
    }
    // Linha entre step 2 e 3: azul se step 2 está completo
    if (stepIndex === 1) {
      const step2Status = getStepStatus("em_andamento");
      return step2Status === "complete" ? "bg-[#3b82f6]" : "bg-[#e5e7eb]";
    }
    return "bg-[#e5e7eb]";
  };

  return (
    <div className={cn(
      "w-full px-2 py-4", 
      className
    )}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
        {steps.map((step) => (
          <div key={step.id} className="relative flex-1">
            <ProcessStep
              id={step.id}
              label={step.label}
              step={step.step}
              status={getStepStatus(step.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Progress connecting lines for mobile */}
      <div className="flex sm:hidden flex-col items-center mt-3 space-y-3">
        {steps.slice(0, -1).map((step, index) => {
          return (
            <div
              key={`line-${step.id}`}
              className={cn(
                "w-1 h-6 rounded-full",
                getLineColor(index)
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProcessTracker;
