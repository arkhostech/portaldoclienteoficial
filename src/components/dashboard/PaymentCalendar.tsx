
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { usePaymentCalendar } from "./usePaymentCalendar";
import { CalendarPaymentList } from "./CalendarPaymentList";

interface PaymentCalendarProps {
  showFullCalendar?: boolean;
}

const PaymentCalendar = ({ showFullCalendar = false }: PaymentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { payments, isLoading } = usePaymentCalendar();

  const paymentDaysMap = payments.reduce((acc, payment) => {
    const key = format(new Date(payment.due_date), "yyyy-MM-dd");
    acc[key] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const dayHasPayment = (date: Date) => {
    return paymentDaysMap[format(date, "yyyy-MM-dd")] || false;
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
                  backgroundColor: '#e7c164', 
                  borderRadius: '50%' 
                }
              }}
            />
          </div>
          <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0 border-l-0 md:border-l">
            <h3 className="font-medium text-sm mb-3">Próximos Pagamentos ({format(selectedDate || new Date(), 'MMMM yyyy')})</h3>
            <CalendarPaymentList payments={payments} selectedMonth={selectedDate || new Date()} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
