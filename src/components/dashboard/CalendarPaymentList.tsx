
import { format } from "date-fns";
import { ScheduledPayment } from "./usePaymentCalendar";

export function CalendarPaymentList({ payments, selectedMonth }: { payments: ScheduledPayment[], selectedMonth: Date }) {
  const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

  const monthPayments = payments
    .filter(payment => {
      const paymentDate = new Date(payment.due_date);
      return paymentDate >= start && paymentDate <= end;
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <div className="space-y-2 max-h-[240px] overflow-y-auto">
      {monthPayments.length > 0 ? (
        monthPayments.map(payment => (
          <div key={payment.id} className="flex items-center justify-between p-2 rounded-md border bg-background hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-medium">{payment.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(payment.due_date), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="font-semibold text-sm">
              R$ {payment.amount}
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-muted-foreground py-2">
          Nenhum pagamento agendado para este mês.
        </div>
      )}
    </div>
  );
}
