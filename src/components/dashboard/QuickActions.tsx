import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare, 
  Calendar,
  HelpCircle 
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const QuickActions = () => {
  const actions = [
    {
      title: "Documentos",
      description: "Visualizar e gerenciar documentos",
      icon: FileText,
      href: "/documents",
      variant: "primary",
      enabled: true
    },
    {
      title: "Chat",
      description: "Conversar com a equipe",
      icon: MessageSquare,
      href: "/messages",
      variant: "tertiary",
      enabled: true
    },
    {
      title: "Agenda",
      description: "Ver compromissos",
      icon: Calendar,
      href: "#",
      variant: "quaternary",
      enabled: false
    },
    {
      title: "Ajuda",
      description: "Central de ajuda",
      icon: HelpCircle,
      href: "#",
      variant: "muted",
      enabled: false
    }
  ];

  const getButtonStyles = (variant: string, enabled: boolean) => {
    if (!enabled) {
      return "bg-gray-50 border-gray-200 text-gray-500 cursor-pointer opacity-60 hover:opacity-80";
    }
    
    switch (variant) {
      case "primary":
        return "bg-[#053D38] border-[#053D38] text-white hover:bg-[#042f2b] hover:border-[#042f2b] shadow-sm hover:shadow-md";
      case "secondary":
        return "bg-[#34675C] border-[#34675C] text-white hover:bg-[#2d5950] hover:border-[#2d5950] shadow-sm hover:shadow-md";
      case "tertiary":
        return "bg-[#A3CCAB] border-[#A3CCAB] text-[#14140F] hover:bg-[#8fbf99] hover:border-[#8fbf99] shadow-sm hover:shadow-md";
      case "quaternary":
        return "bg-[#F26800] border-[#F26800] text-white hover:bg-[#e05f00] hover:border-[#e05f00] shadow-sm hover:shadow-md";
      case "muted":
        return "bg-[#14140F] border-[#14140F] text-white hover:bg-[#0f0f0a] hover:border-[#0f0f0a] shadow-sm hover:shadow-md";
      default:
        return "";
    }
  };

  const handleDisabledClick = (actionTitle: string) => {
    toast.info(`${actionTitle} estará disponível em breve! 🚀`);
  };

  return (
    <Card className="bg-white border border-[#e5e7eb] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#14140F] flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-[#053D38]" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            const ButtonContent = (
              <Button
                variant="outline"
                className={`
                  w-full h-auto p-4 flex-col space-y-2 border transition-all duration-300 group relative
                  ${getButtonStyles(action.variant, action.enabled)}
                `}
                onClick={action.enabled ? undefined : () => handleDisabledClick(action.title)}
              >
                <Icon className={`h-6 w-6 transition-transform duration-200 ${action.enabled ? 'group-hover:scale-110' : ''}`} />
                <div className="text-center">
                  <div className="font-semibold text-xs">{action.title}</div>
                  <div className="text-xs mt-1 leading-tight opacity-90">
                    {action.description}
                  </div>
                </div>
                {!action.enabled && (
                  <div className="absolute -top-1 -right-1">
                    <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full shadow-sm border-2 border-white">
                      Em Breve!
                    </span>
                  </div>
                )}
              </Button>
            );
            
            if (action.enabled) {
              return (
                <Link key={index} to={action.href}>
                  {ButtonContent}
                </Link>
              );
            } else {
              return (
                <div key={index}>
                  {ButtonContent}
                </div>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 