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
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      title: "Upload",
      description: "Enviar novos documentos",
      icon: Upload,
      href: "/documents/upload",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700"
    },
    {
      title: "Chat",
      description: "Conversar com a equipe",
      icon: MessageSquare,
      href: "/chat",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700"
    },
    {
      title: "Agenda",
      description: "Ver compromissos",
      icon: Calendar,
      href: "/schedule",
      color: "from-amber-500 to-amber-600",
      hoverColor: "hover:from-amber-600 hover:to-amber-700"
    },
    {
      title: "Ajuda",
      description: "Central de ajuda",
      icon: HelpCircle,
      href: "/help",
      color: "from-gray-500 to-gray-600",
      hoverColor: "hover:from-gray-600 hover:to-gray-700"
    }
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
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
                    w-full h-auto p-4 flex-col space-y-2 border-0 
                    bg-gradient-to-br ${action.color} ${action.hoverColor}
                    text-white shadow-md hover:shadow-lg 
                    transition-all duration-300 group
                  `}
                >
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-center">
                    <div className="font-semibold text-xs">{action.title}</div>
                    <div className="text-xs opacity-90 mt-1 leading-tight">
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