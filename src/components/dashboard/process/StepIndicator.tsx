
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  status: "complete" | "current" | "upcoming";
  step: number;
}

const StepIndicator = ({ status, step }: StepIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div 
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          status === "complete" && "bg-white",
          status === "current" && "bg-[#b39044] text-white",
          status === "upcoming" && "border border-gray-400"
        )}
      >
        <Check className={cn(
          "w-4 h-4",
          status === "complete" && "text-[#006494]",
          status === "current" && "text-white",
          status === "upcoming" && "text-gray-400"
        )} />
      </div>
      <span className="text-xs font-medium uppercase tracking-wider">
        STEP {step}
      </span>
    </div>
  );
};

export default StepIndicator;
