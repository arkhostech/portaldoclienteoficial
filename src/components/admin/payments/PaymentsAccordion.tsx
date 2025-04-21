
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PaymentsAccordionTable } from "./PaymentsAccordionTable";

interface ScheduledPayment {
  id: string;
  client_id: string;
  title: string;
  amount: string;
  due_date: string;
  description: string | null;
  created_at: string;
  paid_status?: string;
  client_name?: string;
}

interface Client {
  id: string;
  full_name: string;
  [key: string]: any;
}

interface PaymentsAccordionProps {
  groupedPayments: Record<string, ScheduledPayment[]>;
  sortedClientIds: string[];
  expandedItems: string[];
  clients: Client[];
  searchTerm: string;
  onEdit: (payment: ScheduledPayment) => void;
  onDelete: (paymentId: string) => void;
  highlightMatch: (text: string, term: string) => React.ReactNode;
  onValueChange: (value: string[]) => void;
  onTogglePaidStatus: (id: string, paid: boolean) => void;
  updatePayment?: (id: string, values: { amount: string; due_date: string }) => void;
}

export function PaymentsAccordion({
  groupedPayments,
  sortedClientIds,
  expandedItems,
  clients,
  searchTerm,
  onEdit,
  onDelete,
  highlightMatch,
  onValueChange,
  onTogglePaidStatus,
  updatePayment
}: PaymentsAccordionProps & { updatePayment?: (id: string, values: { amount: string; due_date: string }) => void }) {
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client?.full_name || "Cliente Desconhecido";
  };

  return (
    <Accordion 
      type="multiple" 
      value={expandedItems}
      onValueChange={onValueChange}
      className="space-y-2"
    >
      {sortedClientIds.map(clientId => {
        const clientPayments = groupedPayments[clientId] || [];
        const filteredPayments = searchTerm 
          ? clientPayments.filter(payment => 
              payment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              payment.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : clientPayments;

        const clientName = getClientName(clientId).toLowerCase();
        const clientMatchesSearch = clientName.includes(searchTerm.toLowerCase());
        if (searchTerm && filteredPayments.length === 0 && !clientMatchesSearch) {
          return null;
        }

        return (
          <AccordionItem 
            key={clientId} 
            value={clientId} 
            className="border rounded-lg overflow-hidden bg-white"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center justify-between w-full text-left">
                <div className="flex items-center">
                  <span className="font-medium">
                    {searchTerm && clientName.includes(searchTerm.toLowerCase())
                      ? highlightMatch(getClientName(clientId), searchTerm)
                      : getClientName(clientId)}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({clientPayments.length} {clientPayments.length === 1 ? 'pagamento' : 'pagamentos'})
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <PaymentsAccordionTable
                payments={filteredPayments}
                searchTerm={searchTerm}
                highlightMatch={highlightMatch}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePaidStatus={onTogglePaidStatus}
                updatePayment={updatePayment}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
