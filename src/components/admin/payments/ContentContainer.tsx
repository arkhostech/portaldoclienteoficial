
import { ScheduledPayment } from "@/hooks/payments/usePayments";
import { LoadingPayments } from "./LoadingPayments";
import { EmptyPaymentsState } from "./EmptyPaymentsState";

interface ContentContainerProps {
  isLoading: boolean;
  payments: ScheduledPayment[];
  children: React.ReactNode;
}

export function ContentContainer({
  isLoading,
  payments,
  children,
}: ContentContainerProps) {
  if (isLoading) {
    return <LoadingPayments />;
  }

  if (payments.length === 0) {
    return <EmptyPaymentsState />;
  }

  return <div>{children}</div>;
}
