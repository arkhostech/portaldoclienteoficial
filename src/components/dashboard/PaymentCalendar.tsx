
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CalendarDays } from "lucide-react";
import { DayProps } from "react-day-picker";

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

const PaymentCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());

  // Function to style payment dates on calendar
  const isDayWithPayment = (day: Date): boolean => {
    return paymentDates.some(
      payment => 
        payment.date.getDate() === day.getDate() && 
        payment.date.getMonth() === day.getMonth() && 
        payment.date.getFullYear() === day.getFullYear()
    );
  };

  // Function to get payment details for a specific date
  const getPaymentDetails = (day: Date) => {
    return paymentDates.filter(
      payment => 
        payment.date.getDate() === day.getDate() && 
        payment.date.getMonth() === day.getMonth() && 
        payment.date.getFullYear() === day.getFullYear()
    );
  };

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
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="mx-auto"
            modifiers={{
              paymentDay: (day) => isDayWithPayment(day)
            }}
            modifiersClassNames={{
              paymentDay: "bg-primary/20 font-bold text-primary rounded-md"
            }}
            components={{
              Day: (dayProps) => {
                const {
                  date: dayDate,
                  selected,
                  today,
                  modifiers,
                  modifiersClassNames,
                  ...rest
                } = dayProps;

                const payments = getPaymentDetails(dayDate);

                const className = modifiers?.paymentDay
                  ? `${modifiersClassNames?.paymentDay ?? ''} ${rest.className ?? ''}`
                  : rest.className ?? '';

                if (payments.length > 0) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={className}
                          {...rest}
                          data-selected={selected ? "true" : undefined}
                          data-today={today ? "true" : undefined}
                        >
                          {dayDate.getDate()}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="p-2 max-w-xs">
                        <div className="space-y-1">
                          {payments.map((payment, index) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium">{payment.description}</p>
                              <p className="text-green-600">{payment.amount}</p>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <div
                    className={className}
                    {...rest}
                    data-selected={selected ? "true" : undefined}
                    data-today={today ? "true" : undefined}
                  >
                    {dayDate.getDate()}
                  </div>
                );
              }
            }}
          />
        </TooltipProvider>

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
