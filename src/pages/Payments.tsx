
import MainLayout from "@/components/Layout/MainLayout";
import PaymentsSkeleton from "@/components/payments/PaymentsSkeleton";
import PaymentsClientCards from "@/components/payments/PaymentsClientCards";
import PaymentsTableClient from "@/components/payments/PaymentsTableClient";
import PaymentMethodsCards from "@/components/payments/PaymentMethodsCards";
import { useClientPayments } from "@/hooks/useClientPayments";

// Funções utilitárias para formatação
const formatCurrency = (amount: string | number) => {
  let numAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[$R\s]/g, ""))
      : amount;
  if (isNaN(numAmount)) numAmount = 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numAmount);
};
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

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
