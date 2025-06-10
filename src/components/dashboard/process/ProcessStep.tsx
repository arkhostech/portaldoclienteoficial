import { cn } from "@/lib/utils";
import { Check, Clock, FileText, TrendingUp, Trophy } from "lucide-react";

interface ProcessStepProps {
  id: string;
  label: string;
  step: number;
  status: "complete" | "current" | "upcoming";
}

const ProcessStep = ({ id, label, step, status }: ProcessStepProps) => {
  const getStepConfig = () => {
    switch (status) {
      case "complete":
        return {
          bgColor: "bg-[#053D38]",
          borderColor: "border border-[#053D38]",
          iconBg: "bg-white/20",
          iconColor: "text-white",
          textColor: "text-white",
          badgeColor: "bg-white text-[#053D38]",
          badgeText: "Concluído",
          shadow: "shadow-lg shadow-[#053D38]/25",
          hoverShadow: "hover:shadow-xl hover:shadow-[#053D38]/30",
          stepLabelColor: "text-white",
          icon: Check
        };
      case "current":
        return {
          bgColor: "bg-[#F26800]",
          borderColor: "border-2 border-[#F26800]",
          iconBg: "bg-white/20",
          iconColor: "text-white",
          textColor: "text-white",
          badgeColor: "bg-white text-[#F26800]",
          badgeText: "Em Progresso",
          shadow: "shadow-lg shadow-[#F26800]/25",
          hoverShadow: "hover:shadow-xl hover:shadow-[#F26800]/30",
          stepLabelColor: "text-white",
          icon: TrendingUp
        };
      default:
        return {
          bgColor: "bg-[#e5e7eb]",
          borderColor: "border border-[#e5e7eb]",
          iconBg: "bg-white",
          iconColor: "text-[#9ca3af]",
          textColor: "text-[#34675C]",
          badgeColor: "bg-[#f3f4f6] text-[#374151]",
          badgeText: "Pendente",
          shadow: "shadow-sm",
          hoverShadow: "hover:shadow-md",
          stepLabelColor: "text-[#9ca3af]",
          icon: Clock
        };
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return FileText;
      case 2: return TrendingUp;
      case 3: return Trophy;
      default: return FileText;
    }
  };

  const config = getStepConfig();
  const StepIcon = getStepIcon();
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "flex-1 rounded-lg p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer",
        config.bgColor,
        config.borderColor,
        config.shadow,
        config.hoverShadow,
        "hover:-translate-y-1 transform"
      )}
      style={{
        minHeight: '160px',
        minWidth: '170px',
      }}
    >
      <div className="flex flex-col space-y-4 h-full">
        {/* Header with step number and status icon */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-md",
            config.iconBg
          )}>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider",
              config.stepLabelColor
            )}>
              STEP {step}
            </span>
          </div>
          
          <div className={cn(
            "p-2 rounded-md",
            config.iconBg
          )}>
            <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
          </div>
        </div>
        
        {/* Main icon */}
        <div className="flex justify-center py-3">
          <div className={cn(
            "p-4 rounded-full",
            config.iconBg,
            "group-hover:scale-110 transition-transform duration-300"
          )}>
            <StepIcon className={cn("h-7 w-7", config.iconColor)} />
          </div>
        </div>
        
        {/* Title */}
        <div className="text-center">
          <h3 className={cn(
            "font-bold text-base mb-3 leading-tight",
            config.textColor
          )}>
            {label}
          </h3>
          
          {/* Status badge */}
          <span className={cn(
            "inline-block text-xs py-2 px-4 rounded-full font-semibold",
            config.badgeColor
          )}>
            {config.badgeText}
          </span>
        </div>
      </div>
      
      {/* Progress line for non-last steps */}
      {step < 3 && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className={cn(
            "w-4 h-1 rounded-full",
            step === 1 && status === "complete" ? "bg-[#053D38]" : "bg-[#e5e7eb]"
          )} />
        </div>
      )}
    </div>
  );
};

export default ProcessStep;

