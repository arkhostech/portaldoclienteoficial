
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
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

interface PaymentsAccordionTableProps {
  payments: ScheduledPayment[];
  searchTerm: string;
  highlightMatch: (text: string, term: string) => React.ReactNode;
  onEdit: (payment: ScheduledPayment) => void;
  onDelete: (paymentId: string) => void;
  onTogglePaidStatus: (id: string, paid: boolean) => void;
  updatePayment?: (id: string, values: { amount: string; due_date: string }) => void;
}

import { useState } from "react";

export function PaymentsAccordionTable({
  payments,
  searchTerm,
  highlightMatch,
  onEdit,
  onDelete,
  onTogglePaidStatus,
  updatePayment
}: PaymentsAccordionTableProps) {
  const [editPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<null | ScheduledPayment>(null);

  return (
    <>
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
            {payments.map(payment => (
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
    </>
  );
}
