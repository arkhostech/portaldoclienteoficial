import { Card, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientStats } from "@/hooks/useClientData";

interface StatsCardsProps {
  stats: ClientStats;
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const statsData = [
    {
      title: "Documentos",
      value: stats.documentsCount,
      icon: FileText,
      iconColor: "text-[#1e3a8a]",
      bgColor: "bg-[#dbeafe]",
      description: "Total de documentos"
    },
    {
      title: "Conversas",
      value: stats.conversationsCount,
      icon: MessageSquare,
      iconColor: "text-[#3b82f6]",
      bgColor: "bg-[#dbeafe]",
      description: "Conversas ativas"
    },
    {
      title: "Última Atualização",
      value: stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString('pt-BR') : "--",
      icon: Clock,
      iconColor: "text-[#6b7280]",
      bgColor: "bg-[#f3f4f6]",
      description: "Último update",
      isDate: true
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="bg-white border border-[#f3f4f6] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card 
            key={index} 
            className="bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg group-hover:bg-[#dbeafe] transition-colors`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#6b7280] uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-[#000000] mt-1">
                    {stat.isDate ? stat.value : stat.value}
                  </h3>
                  <p className="text-xs text-[#6b7280] mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards; 