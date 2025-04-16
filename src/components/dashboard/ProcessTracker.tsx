
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ProcessStatus = "documentacao" | "em_andamento" | "concluido";

const steps = [
  { id: "documentacao", label: "Documentação" },
  { id: "em_andamento", label: "Em Andamento" },
  { id: "concluido", label: "Concluído" },
] as const;

interface ProcessTrackerProps {
  currentStatus: ProcessStatus;
  className?: string;
}

const ProcessTracker = ({ currentStatus, className }: ProcessTrackerProps) => {
  const getStepStatus = (stepId: ProcessStatus) => {
    const statusIndex = steps.findIndex(s => s.id === currentStatus);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < statusIndex) return "complete";
    if (stepIndex === statusIndex) return "current";
    return "upcoming";
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        
        return (
          <div
            key={step.id}
            className={cn(
              "flex-1 p-2 rounded-md border transition-all min-w-0",
              status === "complete" && "bg-green-50 border-green-200",
              status === "current" && "border-primary border-2",
              status === "upcoming" && "border-gray-200 bg-gray-50",
            )}
          >
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0",
                  status === "complete" && "bg-green-500 text-white",
                  status === "current" && "border-2 border-primary",
                  status === "upcoming" && "border-2 border-gray-300"
                )}
              >
                {status === "complete" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "text-sm font-medium truncate",
                  status === "complete" && "text-green-700",
                  status === "current" && "text-primary",
                  status === "upcoming" && "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessTracker;
