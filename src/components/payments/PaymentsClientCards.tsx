
import PaymentSummaryCards from "@/components/payments/PaymentSummaryCards";

interface PaymentsClientCardsProps {
  totalAmount: number;
  paidAmount: number;
  paymentProgress: number;
  formatCurrency: (amount: string | number) => string;
}

export default function PaymentsClientCards({
  totalAmount,
  paidAmount,
  paymentProgress,
  formatCurrency,
}: PaymentsClientCardsProps) {
  return (
    <PaymentSummaryCards
      totalAmount={totalAmount}
      paidAmount={paidAmount}
      paymentProgress={paymentProgress}
      formatCurrency={formatCurrency}
    />
  );
}
