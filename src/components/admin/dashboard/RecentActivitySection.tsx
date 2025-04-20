
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  client_name: string;
  title: string;
  value: string;
  due_date: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  process_type: string | null;
  date: string;
}

const RecentActivitySection = () => {
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [newClients, setNewClients] = useState<Client[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("scheduled_payments")
          .select(`
            id,
            title,
            amount,
            due_date,
            description,
            client_id,
            clients(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (paymentsError) throw paymentsError;
        
        const formattedRecentPayments = paymentsData?.map(payment => ({
          id: payment.id,
          client_name: payment.clients?.full_name || 'Cliente não encontrado',
          title: payment.title,
          value: payment.amount,
          due_date: payment.due_date,
        })) || [];
        
        setRecentPayments(formattedRecentPayments);
        
        // Fetch new clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select(`
            id, 
            full_name, 
            email, 
            process_type_id, 
            process_types(name),
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (clientsError) throw clientsError;
        
        const formattedNewClients = clientsData?.map(client => ({
          id: client.id,
          name: client.full_name,
          email: client.email,
          process_type: client.process_types?.name || null,
          date: client.created_at,
        })) || [];
        
        setNewClients(formattedNewClients);
        
        // Fetch upcoming payments
        const today = new Date();
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("scheduled_payments")
          .select(`
            id,
            title,
            amount,
            due_date,
            description,
            client_id,
            clients(full_name)
          `)
          .gte('due_date', today.toISOString().split('T')[0])
          .order('due_date', { ascending: true })
          .limit(5);
        
        if (upcomingError) throw upcomingError;
        
        const formattedUpcomingPayments = upcomingData?.map(payment => ({
          id: payment.id,
          client_name: payment.clients?.full_name || 'Cliente não encontrado',
          title: payment.title,
          value: payment.amount,
          due_date: payment.due_date,
        })) || [];
        
        setUpcomingPayments(formattedUpcomingPayments);
        
      } catch (error) {
        console.error("Error fetching activity data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
    } catch (error) {
      console.error("Date parsing error:", error);
      return "Data inválida";
    }
  };

  const renderLoadingState = () => (
    <div className="p-4 text-center text-muted-foreground">
      Carregando dados...
    </div>
  );

  const renderEmptyState = (message: string) => (
    <div className="p-4 text-center text-muted-foreground">
      {message}
    </div>
  );

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
              {isLoading ? (
                renderLoadingState()
              ) : recentPayments.length === 0 ? (
                renderEmptyState("Nenhum pagamento recente encontrado")
              ) : (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <h4 className="font-medium">{payment.client_name}</h4>
                        <p className="text-sm text-muted-foreground">{payment.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payment.value}</p>
                        <p className="text-xs text-muted-foreground">Vence em {formatDate(payment.due_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Novos Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoadingState()
              ) : newClients.length === 0 ? (
                renderEmptyState("Nenhum cliente recente encontrado")
              ) : (
                <div className="space-y-4">
                  {newClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {client.process_type || "Processo não definido"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Adicionado em {formatDate(client.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoadingState()
              ) : upcomingPayments.length === 0 ? (
                renderEmptyState("Nenhum vencimento próximo encontrado")
              ) : (
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <h4 className="font-medium">{payment.client_name}</h4>
                        <p className="text-sm text-muted-foreground">{payment.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payment.value}</p>
                        <p className="text-xs text-muted-foreground">Vence em {formatDate(payment.due_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentActivitySection;
