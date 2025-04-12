
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
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Calendário de Pagamentos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Calendário de Pagamentos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <TooltipProvider>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mx-auto pointer-events-auto"
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

            {selectedPayments.length > 0 && (
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium">Pagamentos no dia {format(selectedDate!, "dd/MM/yyyy")}:</p>
                {selectedPayments.map((payment, index) => (
                  <div key={index} className="p-2">
                    <p className="font-medium">{payment.title}</p>
                    <p className="text-green-600">{payment.amount}</p>
                    {payment.description && <p className="text-xs text-muted-foreground">{payment.description}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-4">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary/20 mr-2"></div>
                  <span>Pagamento Agendado</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Monthly payments summary section */}
          <div className="w-full md:w-1/2 md:border-l md:pl-4">
            <h3 className="font-medium text-base flex items-center mb-4">
              <CircleDollarSign className="h-4 w-4 mr-2 text-primary" />
              Pagamentos em {format(selectedDate || new Date(), "MMMM yyyy")}
            </h3>
            
            {monthlyPayments.length > 0 ? (
              <div className="space-y-4">
                {monthlyPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="border-b pb-3 last:border-0"
                  >
                    <div className="font-medium text-sm">
                      {format(new Date(payment.due_date), "d 'de' MMMM, yyyy")}
                    </div>
                    <div className="text-sm mt-1">{payment.title}</div>
                    <div className="text-green-600 font-medium">{payment.amount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
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
