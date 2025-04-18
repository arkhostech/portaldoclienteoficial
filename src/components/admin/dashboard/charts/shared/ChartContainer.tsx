
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ChartContainerProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const ChartContainer = ({ 
  title, 
  icon: Icon, 
  children, 
  action,
  className 
}: ChartContainerProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {Icon && <Icon className="mr-2 h-5 w-5 text-primary" />}
            {title}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
