
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const RecentActivitySection = () => {
  // Sample data for recent activities
  // In a real application, these would come from API calls
  const recentPayments = [
    { id: 1, client: "Ana Silva", title: "Renovação de Visto", value: "R$ 2.500,00", dueDate: new Date(2025, 3, 20) },
    { id: 2, client: "Miguel Santos", title: "Pagamento EB3", value: "R$ 5.000,00", dueDate: new Date(2025, 3, 22) },
    { id: 3, client: "Julia Pereira", title: "Retainer Fee", value: "R$ 3.200,00", dueDate: new Date(2025, 3, 25) },
    { id: 4, client: "Roberto Martins", title: "Consultoria", value: "R$ 1.800,00", dueDate: new Date(2025, 3, 28) },
    { id: 5, client: "Carolina Ferreira", title: "Ajustes de Status", value: "R$ 2.250,00", dueDate: new Date(2025, 4, 2) },
  ];

  const newClients = [
    { id: 1, name: "Felipe Oliveira", email: "felipe.o@example.com", date: new Date(2025, 3, 15) },
    { id: 2, client: "Mariana Costa", email: "mariana.c@example.com", date: new Date(2025, 3, 14) },
    { id: 3, client: "Paulo Vieira", email: "paulo.v@example.com", date: new Date(2025, 3, 13) },
    { id: 4, client: "Daniela Alves", email: "dani.alves@example.com", date: new Date(2025, 3, 12) },
    { id: 5, client: "Luiz Henrique", email: "luiz.h@example.com", date: new Date(2025, 3, 10) },
  ];

  const upcomingPayments = [
    { id: 1, client: "Ana Silva", title: "Renovação de Visto", value: "R$ 2.500,00", dueDate: new Date(2025, 3, 20) },
    { id: 2, client: "Miguel Santos", title: "Pagamento EB3", value: "R$ 5.000,00", dueDate: new Date(2025, 3, 22) },
    { id: 3, client: "Julia Pereira", title: "Retainer Fee", value: "R$ 3.200,00", dueDate: new Date(2025, 3, 25) },
  ];

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Atividades Recentes</h3>
      
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="payments" className="flex items-center">
            <DollarSign className="mr-1 h-4 w-4" />
            Últimos Pagamentos
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            Novos Clientes
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <CalendarDays className="mr-1 h-4 w-4" />
            Próximos Vencimentos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Últimos Pagamentos Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <h4 className="font-medium">{payment.client}</h4>
                      <p className="text-sm text-muted-foreground">{payment.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.value}</p>
                      <p className="text-xs text-muted-foreground">Vence em {formatDate(payment.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Novos Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Adicionado em {formatDate(client.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <h4 className="font-medium">{payment.client}</h4>
                      <p className="text-sm text-muted-foreground">{payment.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.value}</p>
                      <p className="text-xs text-muted-foreground">Vence em {formatDate(payment.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentActivitySection;
