
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CalendarDays className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-primary" />
          <CardTitle className="text-base sm:text-lg">Calendário de Pagamentos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="w-full mb-3">
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
          
        {/* Monthly payments summary section */}
        <div className="w-full border-t pt-3 mt-auto">
          <h3 className="font-medium text-sm sm:text-base flex items-center mb-2">
            <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
            Pagamentos em {selectedDate && format(selectedDate, "MMMM yyyy")}
          </h3>
          
          <div className="overflow-y-auto max-h-[150px]">
            {monthlyPayments.length > 0 ? (
              <div className="space-y-2">
                {monthlyPayments.slice(0, 3).map((payment) => (
                  <div 
                    key={payment.id} 
                    className="border-b pb-2 last:border-0"
                  >
                    <div className="font-medium text-xs sm:text-sm">
                      {format(new Date(payment.due_date), "d 'de' MMMM")}
                    </div>
                    <div className="text-xs sm:text-sm mt-0.5 truncate">{payment.title}</div>
                    <div className="text-green-600 font-medium text-xs sm:text-sm">{payment.amount}</div>
                  </div>
                ))}
                {monthlyPayments.length > 3 && (
                  <div className="text-xs text-primary font-medium text-center pt-1">
                    +{monthlyPayments.length - 3} mais pagamentos
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3 text-muted-foreground text-sm">
                <p>Nenhum pagamento agendado para este mês.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
