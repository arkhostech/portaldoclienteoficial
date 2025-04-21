
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientPayment } from "@/hooks/useClientPayments";

type Status = "paid" | "pending" | "overdue";
const statusStyles: Record<Status, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
};
const statusLabels: Record<Status, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
};

interface Props {
  isLoading: boolean;
  payments: ClientPayment[];
  formatCurrency: (amount: string | number) => string;
  formatDate: (dateString: string) => string;
}

export default function PaymentsTable({ isLoading, payments, formatCurrency, formatDate }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Pagamentos</CardTitle>
        {payments.some(p => p.status === "pending" || p.status === "overdue") && (
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Fazer Pagamento
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.title}</TableCell>
                  <TableCell>{formatDate(payment.due_date)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[payment.status] || ""}
                    >
                      {statusLabels[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === "paid" ? (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        Recibo
                      </Button>
                    ) : (
                      <Button size="sm">Pagar</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
