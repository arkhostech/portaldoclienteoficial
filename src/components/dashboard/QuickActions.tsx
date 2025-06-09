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
        return "bg-[#1e3a8a] border-[#1e3a8a] text-white hover:bg-[#1e40af] hover:border-[#1e40af] shadow-sm hover:shadow-md";
      case "secondary":
        return "bg-[#3b82f6] border-[#3b82f6] text-white hover:bg-[#2563eb] hover:border-[#2563eb] shadow-sm hover:shadow-md";
      case "tertiary":
        return "bg-[#93c5fd] border-[#93c5fd] text-[#1e3a8a] hover:bg-[#60a5fa] hover:border-[#60a5fa] hover:text-white shadow-sm hover:shadow-md";
      case "quaternary":
        return "bg-[#dbeafe] border-[#dbeafe] text-[#1e3a8a] hover:bg-[#93c5fd] hover:border-[#93c5fd] shadow-sm hover:shadow-md";
      case "muted":
        return "bg-[#f3f4f6] border-[#f3f4f6] text-[#6b7280] hover:bg-[#dbeafe] hover:border-[#dbeafe] hover:text-[#1e3a8a] shadow-sm hover:shadow-md";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-white border border-[#f3f4f6] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#000000] flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-[#3b82f6]" />
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