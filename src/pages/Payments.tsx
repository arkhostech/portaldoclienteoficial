
import MainLayout from "@/components/Layout/MainLayout";
import PaymentsSkeleton from "@/components/payments/PaymentsSkeleton";
import PaymentsClientCards from "@/components/payments/PaymentsClientCards";
import PaymentsTableClient from "@/components/payments/PaymentsTableClient";
import PaymentMethodsCards from "@/components/payments/PaymentMethodsCards";
import { useClientPayments } from "@/hooks/useClientPayments";
import { formatCurrency, formatDate } from "@/components/payments/paymentsUtils";

const Payments = () => {
  const {
    payments,
    isLoading,
    totalAmount,
    paidAmount,
    paymentProgress,
  } = useClientPayments();

  if (isLoading) {
    return (
      <MainLayout title="Pagamentos">
        <PaymentsSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Pagamentos">
      <div className="space-y-6">
        <PaymentsClientCards
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          paymentProgress={paymentProgress}
          formatCurrency={formatCurrency}
        />
        <PaymentsTableClient
          isLoading={isLoading}
          payments={payments}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
        <PaymentMethodsCards />
      </div>
    </MainLayout>
  );
};

export default Payments;
