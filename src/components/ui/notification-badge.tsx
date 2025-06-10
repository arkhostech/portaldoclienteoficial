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
        "absolute rounded-full animate-pulse",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: '#F26800' }}
      aria-label="Nova mensagem"
    />
  );
}; 