
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
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

interface PaymentCalendarProps {
  showFullCalendar?: boolean;
}

const PaymentCalendar = ({ showFullCalendar = false }: PaymentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const paymentDaysMap = payments.reduce((acc, payment) => {
    const key = format(new Date(payment.due_date), "yyyy-MM-dd");
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  
  const dayHasPayment = (date: Date) => {
    return paymentDaysMap[format(date, "yyyy-MM-dd")] || false;
  };
  
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

  const getCurrentMonthPayments = () => {
    if (!selectedDate) return [];
    
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.due_date);
      return paymentDate >= start && paymentDate <= end;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-base">Calendário de Pagamentos</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const monthPayments = getCurrentMonthPayments();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-base">Calendário de Pagamentos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border max-w-full"
              modifiers={{
                payment: (date) => dayHasPayment(date),
              }}
              modifiersStyles={{
                payment: { 
                  fontWeight: 'bold', 
                  color: '#000', 
                  backgroundColor: 'hsl(var(--primary))', 
                  borderRadius: '50%' 
                }
              }}
            />
          </div>

          <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0 border-l-0 md:border-l">
            <h3 className="font-medium text-sm mb-3">Próximos Pagamentos ({format(selectedDate || new Date(), 'MMMM yyyy')})</h3>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {monthPayments.length > 0 ? (
                monthPayments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-2 rounded-md border bg-background hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{payment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.due_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="font-semibold text-sm">
                      R$ {payment.amount}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  Nenhum pagamento agendado para este mês.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
