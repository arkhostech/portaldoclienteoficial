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
      color: "from-blue-500/10 to-blue-600/20 border-blue-200",
      iconColor: "text-blue-600",
      description: "Total de documentos"
    },
    {
      title: "Conversas",
      value: stats.conversationsCount,
      icon: MessageSquare,
      color: "from-purple-500/10 to-purple-600/20 border-purple-200",
      iconColor: "text-purple-600",
      description: "Conversas ativas"
    },
    {
      title: "Última Atualização",
      value: stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString('pt-BR') : "--",
      icon: Clock,
      color: "from-amber-500/10 to-amber-600/20 border-amber-200",
      iconColor: "text-amber-600",
      description: "Último update",
      isDate: true
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
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
            className={`border-0 shadow-md bg-gradient-to-br ${stat.color} hover:shadow-lg transition-all duration-300 group`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/80 rounded-lg group-hover:bg-white transition-colors">
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    {stat.isDate ? stat.value : stat.value}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
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