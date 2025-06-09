import { cn } from "@/lib/utils";

interface NewMessageBadgeProps {
  show: boolean;
  className?: string;
}

export const NewMessageBadge = ({ show, className }: NewMessageBadgeProps) => {
  if (!show) return null;

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full",
        className
      )}
    >
      Novo
    </span>
  );
}; 