import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare, 
  Upload,
  Calendar,
  HelpCircle 
} from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  const actions = [
    {
      title: "Documentos",
      description: "Visualizar e gerenciar documentos",
      icon: FileText,
      href: "/documents",
      variant: "primary"
    },
    {
      title: "Upload",
      description: "Enviar novos documentos",
      icon: Upload,
      href: "/documents/upload",
      variant: "secondary"
    },
    {
      title: "Chat",
      description: "Conversar com a equipe",
      icon: MessageSquare,
      href: "/chat",
      variant: "tertiary"
    },
    {
      title: "Agenda",
      description: "Ver compromissos",
      icon: Calendar,
      href: "/schedule",
      variant: "quaternary"
    },
    {
      title: "Ajuda",
      description: "Central de ajuda",
      icon: HelpCircle,
      href: "/help",
      variant: "muted"
    }
  ];

  const getButtonStyles = (variant: string) => {
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

  return (
    <Card className="bg-white border border-[#e5e7eb] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#14140F] flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-[#053D38]" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Link key={index} to={action.href}>
                <Button
                  variant="outline"
                  className={`
                    w-full h-auto p-4 flex-col space-y-2 border transition-all duration-300 group
                    ${getButtonStyles(action.variant)}
                  `}
                >
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-center">
                    <div className="font-semibold text-xs">{action.title}</div>
                    <div className="text-xs mt-1 leading-tight opacity-90">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 