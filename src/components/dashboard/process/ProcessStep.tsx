
import { cn } from "@/lib/utils";
import StepIndicator from "./StepIndicator";
import StatusBadge from "./StatusBadge";

interface ProcessStepProps {
  id: string;
  label: string;
  step: number;
  status: "complete" | "current" | "upcoming";
}

const ProcessStep = ({ id, label, step, status }: ProcessStepProps) => {
  return (
    <div
      key={id}
      className={cn(
        "flex-1 rounded-lg p-2 transition-all flex flex-col justify-between",
        status === "complete" && "bg-[#006494] text-white",
        status === "current" && "bg-[#F5D547] text-black border-2 border-[#e5c542]",
        status === "upcoming" && "bg-gray-100 text-gray-500",
      )}
      style={{
        minHeight: '130px',
        width: '150px',
      }}
    >
      <div className="flex flex-col space-y-2">
        <StepIndicator status={status} step={step} />
        
        <h3 className={cn(
          "font-medium w-full whitespace-nowrap",
          status === "complete" && "text-white",
          status === "current" && "text-[#b39044]",
          status === "upcoming" && "text-gray-600"
        )}>
          {label}
        </h3>
        
        <div className="mt-1">
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
};

export default ProcessStep;
