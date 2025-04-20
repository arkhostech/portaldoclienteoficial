
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, DollarSign } from "lucide-react";
import { useActivityData } from "./hooks/useActivityData";
import { PaymentsTab } from "./components/PaymentsTab";
import { ClientsTab } from "./components/ClientsTab";

const RecentActivitySection = () => {
  const { recentPayments, newClients, upcomingPayments, isLoading } = useActivityData();

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
          <PaymentsTab 
            payments={recentPayments}
            isLoading={isLoading}
            title="Últimos Pagamentos Agendados"
          />
        </TabsContent>
        
        <TabsContent value="clients">
          <ClientsTab 
            clients={newClients}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <PaymentsTab 
            payments={upcomingPayments}
            isLoading={isLoading}
            title="Próximos Vencimentos"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentActivitySection;
