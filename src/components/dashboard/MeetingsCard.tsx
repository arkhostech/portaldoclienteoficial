
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const MeetingsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Reuniões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Nenhuma reunião agendada no momento.
            </p>
            <Button variant="outline" className="mt-4">Solicitar Agendamento</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingsCard;
