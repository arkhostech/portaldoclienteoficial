import { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { EditInstallmentModal } from "./EditInstallmentModal";

interface ScheduledPayment {
  id: string;
  client_id: string;
  title: string;
  amount: string;
  due_date: string;
  description: string | null;
  created_at: string;
  paid_status?: string;
  client_name?: string;
}

interface Client {
  id: string;
  full_name: string;
  [key: string]: any;
}

interface PaymentsAccordionProps {
  groupedPayments: Record<string, ScheduledPayment[]>;
  sortedClientIds: string[];
  expandedItems: string[];
  clients: Client[];
  searchTerm: string;
  onEdit: (payment: ScheduledPayment) => void;
  onDelete: (paymentId: string) => void;
  highlightMatch: (text: string, term: string) => React.ReactNode;
  onValueChange: (value: string[]) => void;
  onTogglePaidStatus: (id: string, paid: boolean) => void;
  updatePayment?: (id: string, values: { amount: string; due_date: string }) => void;
}

export function PaymentsAccordion({
  groupedPayments,
  sortedClientIds,
  expandedItems,
  clients,
  searchTerm,
  onEdit,
  onDelete,
  highlightMatch,
  onValueChange,
  onTogglePaidStatus,
  updatePayment
}: PaymentsAccordionProps & { updatePayment?: (id: string, values: { amount: string; due_date: string }) => void }) {
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client?.full_name || "Cliente Desconhecido";
  };

  const [editPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<null | ScheduledPayment>(null);

  return (
    <Accordion 
      type="multiple" 
      value={expandedItems}
      onValueChange={onValueChange}
      className="space-y-2"
    >
      {sortedClientIds.map(clientId => {
        const clientPayments = groupedPayments[clientId] || [];
        const filteredPayments = searchTerm 
          ? clientPayments.filter(payment => 
              payment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              payment.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : clientPayments;

        const clientName = getClientName(clientId).toLowerCase();
        const clientMatchesSearch = clientName.includes(searchTerm.toLowerCase());
        if (searchTerm && filteredPayments.length === 0 && !clientMatchesSearch) {
          return null;
        }

        return (
          <AccordionItem 
            key={clientId} 
            value={clientId} 
            className="border rounded-lg overflow-hidden bg-white"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center justify-between w-full text-left">
                <div className="flex items-center">
                  <span className="font-medium">
                    {searchTerm && clientName.includes(searchTerm.toLowerCase())
                      ? highlightMatch(getClientName(clientId), searchTerm)
                      : getClientName(clientId)}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({clientPayments.length} {clientPayments.length === 1 ? 'pagamento' : 'pagamentos'})
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Título</th>
                      <th className="text-left py-3 px-4">Valor</th>
                      <th className="text-left py-3 px-4">Vencimento</th>
                      <th className="text-left py-3 px-4">Pago?</th>
                      <th className="text-left py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {searchTerm
                            ? highlightMatch(payment.title, searchTerm)
                            : payment.title}
                        </td>
                        <td className="py-3 px-4 font-medium flex items-center gap-2">
                          {searchTerm && payment.amount.includes(searchTerm)
                            ? highlightMatch(payment.amount, searchTerm)
                            : payment.amount}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="p-1 h-7 w-7"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                              setEditPaymentModalOpen(true);
                            }}
                            title="Editar valor/data"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(payment.due_date), "dd/MM/yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={payment.paid_status === "paid"}
                            onCheckedChange={(checked) =>
                              onTogglePaidStatus(payment.id, Boolean(checked))
                            }
                          />
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(payment);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(payment.id);
                              }}
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
            </AccordionContent>
            <EditInstallmentModal
              open={editPaymentModalOpen}
              onClose={() => setEditPaymentModalOpen(false)}
              payment={
                selectedPayment
                  ? {
                      id: selectedPayment.id,
                      amount: selectedPayment.amount,
                      due_date: selectedPayment.due_date,
                    }
                  : null
              }
              onSave={(id, data) => {
                if (updatePayment) {
                  updatePayment(id, data);
                }
                setEditPaymentModalOpen(false);
                setSelectedPayment(null);
              }}
            />
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
