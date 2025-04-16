
import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CalendarDays, CircleDollarSign } from "lucide-react";
import { format, isSameMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface ScheduledPayment {
  id: string;
  client_id: string;
  title: string;
  amount: string;
  due_date: string;
  description: string | null;
}

const PaymentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Create a map with payment dates as keys (to use as modifier)
  const paymentDaysMap = payments.reduce((acc, payment) => {
    const key = format(new Date(payment.due_date), "yyyy-MM-dd");
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  
  // Get payments for the selected date
  const selectedPayments = payments.filter(p => 
    selectedDate &&
    format(new Date(p.due_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  // Get all payments for the selected month
  const monthlyPayments = useMemo(() => {
    if (!selectedDate) return [];
    
    return payments
      .filter(payment => isSameMonth(new Date(payment.due_date), selectedDate))
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [payments, selectedDate]);

  // Fetch payments for the current user
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("scheduled_payments")
          .select("*")
          .eq("client_id", user.id)
          .order("due_date", { ascending: true });
        
        if (error) {
          console.error("Error fetching payments:", error);
          return;
        }
        
        setPayments(data || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-base sm:text-lg">Calendário de Pagamentos</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-base sm:text-lg">Calendário de Pagamentos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Calendar section */}
          <div className="flex flex-col h-full">
            <TooltipProvider>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mx-auto max-w-full"
                modifiers={{
                  paymentDay: (day) => {
                    const key = format(day, "yyyy-MM-dd");
                    return paymentDaysMap[key];
                  }
                }}
                modifiersClassNames={{
                  paymentDay: "bg-primary/20 font-bold text-primary rounded-md"
                }}
              />
            </TooltipProvider>
            
            {/* Monthly payments summary - now inside the calendar column */}
            {monthlyPayments.length > 0 ? (
              <div className="w-full border-t pt-2 mt-2">
                <h3 className="text-xs sm:text-sm flex items-center mb-1">
                  <CircleDollarSign className="h-3 w-3 mr-1 text-primary" />
                  Pagamentos {selectedDate && format(selectedDate, "MMM")}
                </h3>
                
                <div className="overflow-y-auto max-h-[60px]">
                  <div className="space-y-1">
                    {monthlyPayments.slice(0, 2).map((payment) => (
                      <div 
                        key={payment.id} 
                        className="text-xs py-0.5"
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-1">
                            {format(new Date(payment.due_date), "d/MM")}:
                          </span>
                          <span className="truncate flex-1">{payment.title}</span>
                          <span className="text-green-600 font-medium ml-1">{payment.amount}</span>
                        </div>
                      </div>
                    ))}
                    {monthlyPayments.length > 2 && (
                      <div className="text-xs text-primary font-medium pt-0.5 text-right">
                        +{monthlyPayments.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full border-t pt-2 mt-2">
                <div className="text-center py-1 text-muted-foreground text-xs">
                  <p>Nenhum pagamento neste mês.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Summary section - side by side with calendar in the same card */}
          <div className="flex flex-col">
            <div className="border-l-0 md:border-l border-border p-2 md:pl-5 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Resumo de Pagamentos</h3>
              </div>
              
              <div className="space-y-5 flex-1">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Próximo pagamento:</span>
                    <span className="font-medium">15/06/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor:</span>
                    <span className="font-medium text-green-600">R$ 1.500,00</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total aberto:</span>
                    <span className="font-semibold">R$ 4.500,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
