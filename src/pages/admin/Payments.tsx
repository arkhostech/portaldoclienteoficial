
import { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, CalendarPlus, Search, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { AdminPaymentForm } from "@/components/admin/payments/AdminPaymentForm";
import { toast } from "sonner";

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
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Erro ao buscar pagamentos agendados");
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
        toast.success("Pagamento excluído com sucesso");
        fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Erro ao excluir pagamento");
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

  // Filter payments based on search term
  const filteredPayments = payments.filter((payment) => {
    const searchString = searchTerm.toLowerCase();
    return (
      payment.title.toLowerCase().includes(searchString) ||
      payment.amount.toLowerCase().includes(searchString) ||
      payment.client_name?.toLowerCase().includes(searchString) ||
      (payment.description && payment.description.toLowerCase().includes(searchString))
    );
  });

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
              <CardTitle>Pagamentos</CardTitle>
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
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-2 text-lg font-semibold">Nenhum pagamento agendado</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Nenhum pagamento encontrado para essa busca."
                    : "Agende um novo pagamento para começar."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Cliente</th>
                      <th className="text-left py-3 px-4">Título</th>
                      <th className="text-left py-3 px-4">Valor</th>
                      <th className="text-left py-3 px-4">Data de Vencimento</th>
                      <th className="text-left py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{payment.client_name}</td>
                        <td className="py-3 px-4">{payment.title}</td>
                        <td className="py-3 px-4 font-medium">{payment.amount}</td>
                        <td className="py-3 px-4">
                          {format(new Date(payment.due_date), "dd/MM/yyyy")}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(payment)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(payment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
