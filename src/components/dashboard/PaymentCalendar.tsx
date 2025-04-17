
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
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

  const getCurrentMonthPayments = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.due_date);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
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

  const thisMonthPayments = getCurrentMonthPayments();

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
        <div className="flex flex-col md:flex-row gap-4">
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
                  backgroundColor: '#FEC6A1', 
                  color: 'black', 
                  borderRadius: '8px'
                }
              }}
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-lg font-medium mb-3">Próximos Pagamentos</h3>
            {thisMonthPayments.length > 0 ? (
              <div className="space-y-3">
                {thisMonthPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="p-3 border rounded-md bg-slate-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{payment.title}</span>
                      <span className="text-green-600 font-medium">R$ {payment.amount}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Vencimento: {format(new Date(payment.due_date), "dd/MM/yyyy")}
                    </div>
                    {payment.description && (
                      <div className="text-sm mt-1">{payment.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground">Sem pagamentos programados para este mês</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
