import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  show: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBadge = ({ show, className, size = 'sm' }: NotificationBadgeProps) => {
  if (!show) return null;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  return (
    <div 
      className={cn(
        "absolute rounded-full bg-green-500 animate-pulse",
        sizeClasses[size],
        className
      )}
      aria-label="Nova mensagem"
    />
  );
}; 