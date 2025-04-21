
import MainLayout from "@/components/Layout/MainLayout";
import PaymentSummaryCards from "@/components/payments/PaymentSummaryCards";
import PaymentsTable from "@/components/payments/PaymentsTable";
import PaymentMethodsCards from "@/components/payments/PaymentMethodsCards";
import { useClientPayments } from "@/hooks/useClientPayments";
import { Skeleton } from "@/components/ui/skeleton";

// Funções utilitárias para formatação
const formatCurrency = (amount: string | number) => {
  let numAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[$R\s]/g, '')) 
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
  const { payments, isLoading, totalAmount, paidAmount, paymentProgress } = useClientPayments();

  if (isLoading) {
    return (
      <MainLayout title="Pagamentos">
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-40 w-full mt-4" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Pagamentos">
      <div className="space-y-6">
        <PaymentSummaryCards
          totalAmount={totalAmount}
          paidAmount={paidAmount}
          paymentProgress={paymentProgress}
          formatCurrency={formatCurrency}
        />
        <PaymentsTable
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
