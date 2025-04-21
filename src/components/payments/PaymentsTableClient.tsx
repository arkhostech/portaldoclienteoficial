
import PaymentsTable from "@/components/payments/PaymentsTable";
import { ClientPayment } from "@/hooks/useClientPayments";

interface PaymentsTableClientProps {
  isLoading: boolean;
  payments: ClientPayment[];
  formatCurrency: (amount: string | number) => string;
  formatDate: (dateString: string) => string;
}

export default function PaymentsTableClient({
  isLoading,
  payments,
  formatCurrency,
  formatDate,
}: PaymentsTableClientProps) {
  return (
    <PaymentsTable
      isLoading={isLoading}
      payments={payments}
      formatCurrency={formatCurrency}
      formatDate={formatDate}
    />
  );
}
