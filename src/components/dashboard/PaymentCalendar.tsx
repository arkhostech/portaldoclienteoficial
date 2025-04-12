
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

// Mock data for payment dates - replace with real data later
const paymentDates = [
  {
    date: new Date(2025, 3, 15), // April 15, 2025
    description: "USCIS Filing Fee",
    amount: "$535.00"
  },
  {
    date: new Date(2025, 3, 22), // April 22, 2025
    description: "Attorney Fee",
    amount: "$1,200.00"
  },
  {
    date: new Date(2025, 4, 10), // May 10, 2025
    description: "Biometrics Fee",
    amount: "$85.00"
  }
];

// Create a map with payment dates as keys (to use as modifier)
const paymentDaysMap = paymentDates.reduce((acc, payment) => {
  const key = format(payment.date, "yyyy-MM-dd");
  acc[key] = true;
  return acc;
}, {} as Record<string, boolean>);

const PaymentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get payments for the selected date
  const selectedPayments = paymentDates.filter(p => 
    selectedDate &&
    p.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Calendário de Pagamentos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="mx-auto"
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
          <div className="mt-4 space-y-2 text-sm text-center">
            <p className="font-medium">Pagamentos no dia {format(selectedDate!, "dd/MM/yyyy")}:</p>
            {selectedPayments.map((payment, index) => (
              <div key={index} className="p-2">
                <p className="font-medium">{payment.description}</p>
                <p className="text-green-600">{payment.amount}</p>
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
      </CardContent>
    </Card>
  );
};

export default PaymentCalendar;
