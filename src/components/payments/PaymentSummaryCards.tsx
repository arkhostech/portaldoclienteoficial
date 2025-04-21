
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  totalAmount: number;
  paidAmount: number;
  paymentProgress: number;
  formatCurrency: (amount: string | number) => string;
}

export default function PaymentSummaryCards({
  totalAmount,
  paidAmount,
  paymentProgress,
  formatCurrency,
}: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold">{formatCurrency(totalAmount)}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Valor Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-green-600" />
            <h3 className="text-2xl font-bold">{formatCurrency(paidAmount)}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Progresso do Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{paymentProgress}%</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
