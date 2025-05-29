
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Payment } from "../types/activity";
import { LoadingState, EmptyState } from "./SharedStates";
import { formatDate } from "../utils/dateFormat";

interface PaymentsTabProps {
  payments: Payment[];
  isLoading: boolean;
  title: string;
}

// This is just a stub component to fix build errors
// It won't be used in the application anymore since payment functionality has been removed
export const PaymentsTab = ({ payments, isLoading, title }: PaymentsTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : payments.length === 0 ? (
          <EmptyState message="Nenhum pagamento encontrado" />
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <h4 className="font-medium">{payment.client_name}</h4>
                  <p className="text-sm text-muted-foreground">{payment.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.value}</p>
                  <p className="text-xs text-muted-foreground">Data: {formatDate(payment.due_date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
