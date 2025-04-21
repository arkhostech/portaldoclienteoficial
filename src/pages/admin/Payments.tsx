
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClients } from "@/hooks/useClients";
import { AdminPaymentForm } from "@/components/admin/payments/AdminPaymentForm";
import { PageHeader } from "@/components/admin/payments/PageHeader";
import { PaymentSearch } from "@/components/admin/payments/PaymentSearch";
import { PaymentsContent } from "@/components/admin/payments/PaymentsContent";
import { usePayments, ScheduledPayment } from "@/hooks/payments/usePayments";
import { usePaymentsFilter } from "@/hooks/payments/usePaymentsFilter";

export default function AdminPayments() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editPayment, setEditPayment] = useState<ScheduledPayment | null>(null);
  const { clients, isLoading: isClientsLoading } = useClients();
  
  const {
    payments,
    isLoading,
    groupedPayments,
    sortedClientIds,
    handleDelete,
    fetchPayments,
    togglePaidStatus, // NOVO!
  } = usePayments(clients);
  
  const {
    searchTerm,
    setSearchTerm,
    expandedItems,
    setExpandedItems,
    toggleAllAccordions,
    getFilteredClientIds
  } = usePaymentsFilter(sortedClientIds, clients);

  const handleEdit = (payment: ScheduledPayment) => {
    setEditPayment({
      ...payment,
      due_date: payment.due_date,
    });
    setOpenDialog(true);
  };

  const filteredClientIds = getFilteredClientIds();

  return (
    <MainLayout title="Pagamentos Agendados">
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader openDialog={() => setOpenDialog(true)} />

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <PaymentSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <PaymentsContent
              isLoading={isLoading || isClientsLoading}
              payments={payments}
              groupedPayments={groupedPayments}
              filteredClientIds={filteredClientIds}
              expandedItems={expandedItems}
              sortedClientIds={sortedClientIds}
              clients={clients}
              searchTerm={searchTerm}
              onEdit={handleEdit}
              onDelete={handleDelete}
              toggleAllAccordions={toggleAllAccordions}
              setExpandedItems={setExpandedItems}
              onTogglePaidStatus={togglePaidStatus}
            />
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        >
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
                    // Faltou o paid_status para garantir edição individual!
                    is_paid: editPayment.paid_status === "paid",
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
