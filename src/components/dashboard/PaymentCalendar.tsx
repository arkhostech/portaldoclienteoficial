
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
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-base sm:text-lg">Calendário de Pagamentos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Calendar Card */}
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <CalendarDays className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-primary" />
            <CardTitle className="text-base sm:text-lg">Calendário</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between py-1 px-2 sm:px-3 sm:py-2">
          <div className="w-full">
            <TooltipProvider>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mx-auto max-w-full pointer-events-auto"
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
          </div>
            
          {/* Monthly payments summary section - More compact */}
          {monthlyPayments.length > 0 ? (
            <div className="w-full border-t pt-2 mt-auto">
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
            <div className="w-full border-t pt-2 mt-auto">
              <div className="text-center py-1 text-muted-foreground text-xs">
                <p>Nenhum pagamento neste mês.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment Summary Card */}
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <CircleDollarSign className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-primary" />
            <CardTitle className="text-base sm:text-lg">Resumo de Pagamentos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between p-4">
          <div className="space-y-3 flex-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Próximo pagamento:</span>
              <span className="font-medium">15/06/2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className="font-medium text-green-600">R$ 1.500,00</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between">
              <span className="font-medium">Total aberto:</span>
              <span className="font-semibold">R$ 4.500,00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCalendar;
