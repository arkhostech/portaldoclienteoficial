
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "complete" | "current" | "upcoming";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "text-xs py-1 px-3 rounded-full inline-block whitespace-nowrap",
      status === "complete" && "bg-white/20 text-white",
      status === "current" && "bg-[#e5c542] text-white",
      status === "upcoming" && "bg-gray-200 text-gray-500"
    )}>
      {status === "complete" ? "Completed" : 
       status === "current" ? "In Progress" : "Pending"}
    </span>
  );
};

export default StatusBadge;
