
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";

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

  // Get payments for the selected date
  const selectedDatePayments = selectedDate 
    ? payments.filter(payment => 
        format(new Date(payment.due_date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : [];

  // Calculate total amount for the selected date
  const totalAmount = selectedDatePayments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount.replace(/[^\d,.-]/g, '').replace(',', '.'));
    return isNaN(amount) ? sum : sum + amount;
  }, 0);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calendar Section */}
          <div>
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
          
          {/* Payment Summary Section */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
            <div className="flex items-center mb-3">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              <h3 className="text-sm font-medium">
                Pagamentos para {selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}:
              </h3>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[220px]">
              {selectedDatePayments.length > 0 ? (
                <>
                  {/* List of payments for the selected date */}
                  {selectedDatePayments.map(payment => (
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
                  
                  {/* Total */}
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Nenhum pagamento agendado para esta data.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
