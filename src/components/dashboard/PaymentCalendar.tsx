
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CalendarDays, CircleDollarSign } from "lucide-react";
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
  
  // Create a map with payment dates as keys (to use as modifier)
  const paymentDaysMap = payments.reduce((acc, payment) => {
    const key = format(new Date(payment.due_date), "yyyy-MM-dd");
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);
  
  // Function to highlight days with payments
  const dayHasPayment = (date: Date) => {
    return paymentDaysMap[format(date, "yyyy-MM-dd")] || false;
  };
  
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
              <CardTitle className="text-base">Calendário</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // If not showing the full calendar, show the compact summary
  if (!showFullCalendar) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-base">Calendário</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="space-y-3">
            {/* Payment Summary section */}
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold text-sm">Resumo de Pagamentos</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Próximo:</span>
                    <span className="font-medium text-sm">15/06/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Valor:</span>
                    <span className="font-medium text-sm text-green-600">R$ 1.500,00</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">Total aberto:</span>
                    <span className="font-semibold text-sm">R$ 4.500,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full calendar view
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-base">Calendário de Pagamentos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiers={{
              payment: (date) => dayHasPayment(date),
            }}
            modifiersStyles={{
              payment: { fontWeight: 'bold', color: '#0ea5e9', textDecoration: 'underline' }
            }}
          />
        </div>
        
        {/* Optional: Display selected day's payments */}
        {selectedDate && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">
              Pagamentos para {format(selectedDate, "dd/MM/yyyy")}:
            </h3>
            
            {payments
              .filter(payment => format(new Date(payment.due_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
              .map(payment => (
                <div key={payment.id} className="p-2 bg-blue-50 rounded-md mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{payment.title}</span>
                    <span className="text-green-600">R$ {payment.amount}</span>
                  </div>
                  {payment.description && (
                    <p className="text-xs text-gray-600 mt-1">{payment.description}</p>
                  )}
                </div>
              ))}
            
            {payments.filter(payment => 
              format(new Date(payment.due_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
            ).length === 0 && (
              <p className="text-sm text-gray-500">Nenhum pagamento agendado para esta data.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
