
import { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, CalendarPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { AdminPaymentForm } from "@/components/admin/payments/AdminPaymentForm";
import { toast } from "@/hooks/use-toast";
import { PaymentsAccordion } from "@/components/admin/payments/PaymentsAccordion";
import { PaymentsAccordionHeader } from "@/components/admin/payments/PaymentsAccordionHeader";
import { highlightMatch } from "@/components/admin/payments/PaymentsUtils";

interface ScheduledPayment {
  id: string;
  client_id: string;
  title: string;
  amount: string;
  due_date: string;
  description: string | null;
  created_at: string;
  client_name?: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editPayment, setEditPayment] = useState<ScheduledPayment | null>(null);
  const { clients, isLoading: isClientsLoading } = useClients();

  // Accordion state
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [groupedPayments, setGroupedPayments] = useState<Record<string, ScheduledPayment[]>>({});
  const [sortedClientIds, setSortedClientIds] = useState<string[]>([]);

  // Fetch all payments
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_payments")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Add client names to payments for display
      const paymentsWithClientNames = await Promise.all(
        (data || []).map(async (payment) => {
          const client = clients.find((c) => c.id === payment.client_id);
          return {
            ...payment,
            client_name: client?.full_name || "Cliente Desconhecido",
            due_date: payment.due_date, // Ensure due_date is included
          };
        })
      );

      setPayments(paymentsWithClientNames);
      
      // Group payments by client
      const grouped = paymentsWithClientNames.reduce<Record<string, ScheduledPayment[]>>((acc, payment) => {
        if (!acc[payment.client_id]) {
          acc[payment.client_id] = [];
        }
        acc[payment.client_id].push(payment);
        return acc;
      }, {});
      
      setGroupedPayments(grouped);
      
      // Sort client IDs by client name
      const sortedIds = Object.keys(grouped).sort((a, b) => {
        const clientA = clients.find(c => c.id === a);
        const clientB = clients.find(c => c.id === b);
        return (clientA?.full_name || "").localeCompare(clientB?.full_name || "");
      });
      
      setSortedClientIds(sortedIds);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Erro",
        description: "Erro ao buscar pagamentos agendados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    if (!isClientsLoading && clients.length > 0) {
      fetchPayments();
    }
  }, [isClientsLoading, clients]);

  // Handle payment deletion
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pagamento?")) {
      try {
        const { error } = await supabase
          .from("scheduled_payments")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Pagamento excluído com sucesso",
          variant: "default"
        });
        fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir pagamento",
          variant: "destructive"
        });
      }
    }
  };

  // Handle payment editing
  const handleEdit = (payment: ScheduledPayment) => {
    setEditPayment({
      ...payment,
      due_date: payment.due_date,
    });
    setOpenDialog(true);
  };

  // Toggle all accordions
  const toggleAllAccordions = () => {
    if (expandedItems.length === sortedClientIds.length) {
      setExpandedItems([]);
    } else {
      setExpandedItems([...sortedClientIds]);
    }
  };

  // Filter client IDs based on search
  const getFilteredClientIds = () => {
    if (!searchTerm) return sortedClientIds;
    
    return sortedClientIds.filter(clientId => {
      const client = clients.find(c => c.id === clientId);
      const payments = groupedPayments[clientId] || [];
      
      // Check if client name matches
      if (client?.full_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      // Check if any payment details match
      return payments.some(payment => 
        payment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  };

  const filteredClientIds = getFilteredClientIds();

  return (
    <MainLayout title="Pagamentos Agendados">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Pagamentos Agendados</h1>
            <p className="text-muted-foreground">
              Gerencie os pagamentos agendados para os clientes.
            </p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Agendar Novo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editPayment ? "Editar Pagamento" : "Agendar Novo Pagamento"}
                </DialogTitle>
              </DialogHeader>
              <AdminPaymentForm
                clients={clients}
                onSuccess={() => {
                  setOpenDialog(false);
                  setEditPayment(null);
                  fetchPayments();
                }}
                initialData={
                  editPayment
                    ? {
                        id: editPayment.id,
                        client_id: editPayment.client_id,
                        title: editPayment.title,
                        amount: editPayment.amount,
                        due_date: new Date(editPayment.due_date),
                        description: editPayment.description || undefined,
                      }
                    : undefined
                }
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pagamentos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-2 text-lg font-semibold">Nenhum pagamento agendado</h3>
                <p className="text-muted-foreground">
                  Agende um novo pagamento para começar.
                </p>
              </div>
            ) : (
              <div>
                <PaymentsAccordionHeader 
                  toggleAllAccordions={toggleAllAccordions}
                  expandedItems={expandedItems}
                  sortedClientIds={sortedClientIds}
                />
                
                {filteredClientIds.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum pagamento encontrado para essa busca.
                    </p>
                  </div>
                ) : (
                  <PaymentsAccordion 
                    groupedPayments={groupedPayments}
                    sortedClientIds={filteredClientIds}
                    expandedItems={expandedItems}
                    clients={clients}
                    searchTerm={searchTerm}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    highlightMatch={highlightMatch}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
