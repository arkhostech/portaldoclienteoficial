
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
    const statusIndex = steps.findIndex(s => s.id === currentStatus);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < statusIndex) return "complete";
    if (stepIndex === statusIndex) return "current";
    return "upcoming";
  };

  return (
    <div className={cn("flex w-full py-2 gap-1", className)}>
      {steps.map((step) => (
        <ProcessStep
          key={step.id}
          id={step.id}
          label={step.label}
          step={step.step}
          status={getStepStatus(step.id)}
        />
      ))}
    </div>
  );
};

export default ProcessTracker;
