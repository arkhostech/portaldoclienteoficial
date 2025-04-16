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
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Calendar section - Made smaller */}
          <div className="flex justify-center">
            <TooltipProvider>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mx-auto max-w-full scale-90 origin-top-left"
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
          
          {/* Payment Summary section */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-border lg:pl-4 pt-3 lg:pt-0">
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
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
