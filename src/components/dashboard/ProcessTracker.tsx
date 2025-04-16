
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const statusIndex = steps.findIndex(s => s.id === currentStatus);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < statusIndex) return "complete";
    if (stepIndex === statusIndex) return "current";
    return "upcoming";
  };

  return (
    <div className={cn("flex w-full px-2 py-2 gap-2", className)}>
      {steps.map((step) => {
        const status = getStepStatus(step.id);
        
        return (
          <div
            key={step.id}
            className={cn(
              "flex-1 rounded-lg p-3 transition-all flex flex-col justify-between",
              status === "complete" && "bg-blue-600 text-white",
              status === "current" && "border-2 border-blue-600",
              status === "upcoming" && "bg-gray-100 text-gray-500",
            )}
            style={{
              width: 'calc(100% / 3 - 8px)',
              minHeight: '120px',
            }}
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    status === "complete" && "bg-white",
                    status === "current" && "bg-blue-600 text-white",
                    status === "upcoming" && "border border-gray-400"
                  )}
                >
                  <Check className={cn(
                    "w-4 h-4",
                    status === "complete" && "text-blue-600",
                    status === "current" && "text-white",
                    status === "upcoming" && "text-gray-400"
                  )} />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider">
                  STEP {step.step}
                </span>
              </div>
              
              <h3 className={cn(
                "font-medium truncate w-full",
                status === "complete" && "text-white",
                status === "current" && "text-blue-600",
                status === "upcoming" && "text-gray-600"
              )}>
                {step.label}
              </h3>
              
              <div className="mt-1">
                <span className={cn(
                  "text-xs py-1 px-3 rounded-full inline-block whitespace-nowrap",
                  status === "complete" && "bg-white/20 text-white",
                  status === "current" && "bg-blue-100 text-blue-600",
                  status === "upcoming" && "bg-gray-200 text-gray-500"
                )}>
                  {status === "complete" ? "Completed" : 
                   status === "current" ? "In Progress" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessTracker;
