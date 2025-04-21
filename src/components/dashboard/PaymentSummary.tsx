
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, isBefore, isAfter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const PaymentSummary = () => {
  const [nextPayment, setNextPayment] = useState<{date: string, amount: string} | null>(null);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchPaymentSummary = async () => {
      setIsLoading(true);
      try {
        // Get all payments
        const { data, error } = await supabase
          .from("scheduled_payments")
          .select("*")
          .eq("client_id", user.id)
          .eq("paid_status", "pending")
          .order("due_date", { ascending: true });

        if (error) {
          console.error("Error fetching payments:", error);
          return;
        }

        if (!data || data.length === 0) {
          setIsLoading(false);
          return;
        }

        // Calculate total pending amount
        const total = data.reduce((sum, payment) => {
          const amount = parseFloat(payment.amount.replace(/[$R\s]/g, '')) || 0;
          return sum + amount;
        }, 0);
        
        setTotalPending(total);

        // Find next payment (first one with a due_date after today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const next = data.find(payment => {
          const dueDate = new Date(payment.due_date);
          return isAfter(dueDate, today) || format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        });
        
        // If no future payment, get the most recent past payment
        const nextOrNearest = next || data[0];
        
        if (nextOrNearest) {
          setNextPayment({
            date: nextOrNearest.due_date,
            amount: nextOrNearest.amount
          });
        }
      } catch (error) {
        console.error("Error calculating payment summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentSummary();
    
    // Set up real-time subscription to payment changes
    if (!user) return;
    
    const channel = supabase
      .channel("client-payment-summary")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_payments",
          filter: `client_id=eq.${user.id}`,
        },
        (_payload) => {
          fetchPaymentSummary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-base">Resumo de Pagamentos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="pt-4">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col">
              <div className="space-y-3">
                {nextPayment ? (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Próximo:</span>
                        <span className="font-medium text-sm">{formatDate(nextPayment.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Valor:</span>
                        <span className="font-medium text-sm text-green-600">
                          {formatCurrency(nextPayment.amount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium">Total aberto:</span>
                        <span className="font-semibold text-sm">{formatCurrency(totalPending)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Nenhum pagamento pendente
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
