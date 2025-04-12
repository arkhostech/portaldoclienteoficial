
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, UserCog, Zap } from "lucide-react";

const QuickActionsCard = () => {
  const handleContactAttorney = () => {
    // Implementation for contacting attorney
    console.log("Contact attorney clicked");
    // This would typically open a dialog, redirect to a contact form, or directly initiate communication
  };

  const handleScheduleCall = () => {
    // Implementation for scheduling a call
    console.log("Schedule call clicked");
    // This would typically open a calendar scheduling interface
  };

  const handleUpdateInfo = () => {
    // Implementation for updating client information
    console.log("Update info clicked");
    // This would typically redirect to a profile/settings page
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Ações Rápidas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleContactAttorney}
        >
          <Phone className="mr-2 h-4 w-4" />
          Contatar Advogado
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleScheduleCall}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Agendar Ligação
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleUpdateInfo}
        >
          <UserCog className="mr-2 h-4 w-4" />
          Atualizar Meus Dados
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
