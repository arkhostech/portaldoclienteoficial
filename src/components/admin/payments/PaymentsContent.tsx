
import { Client } from "@/services/clients/types";
import { ScheduledPayment } from "@/hooks/payments/usePayments";
import { PaymentsAccordionHeader } from "./PaymentsAccordionHeader";
import { ContentContainer } from "./ContentContainer";
import { PaymentsList } from "./PaymentsList";

interface PaymentsContentProps {
  isLoading: boolean;
  payments: ScheduledPayment[];
  groupedPayments: Record<string, ScheduledPayment[]>;
  filteredClientIds: string[];
  expandedItems: string[];
  sortedClientIds: string[];
  clients: Client[];
  searchTerm: string;
  onEdit: (payment: ScheduledPayment) => void;
  onDelete: (paymentId: string) => void;
  toggleAllAccordions: () => void;
  setExpandedItems: (value: string[]) => void;
  onTogglePaidStatus: (id: string, paid: boolean) => void;
  updatePayment: (id: string, values: { amount: string; due_date: string }) => void;
}

export function PaymentsContent({
  isLoading,
  payments,
  groupedPayments,
  filteredClientIds,
  expandedItems,
  sortedClientIds,
  clients,
  searchTerm,
  onEdit,
  onDelete,
  toggleAllAccordions,
  setExpandedItems,
  onTogglePaidStatus,
  updatePayment,
}: PaymentsContentProps) {
  return (
    <ContentContainer isLoading={isLoading} payments={payments}>
      <PaymentsAccordionHeader 
        toggleAllAccordions={toggleAllAccordions}
        expandedItems={expandedItems}
        sortedClientIds={sortedClientIds}
      />
      <PaymentsList 
        groupedPayments={groupedPayments}
        filteredClientIds={filteredClientIds}
        expandedItems={expandedItems}
        clients={clients}
        searchTerm={searchTerm}
        onEdit={onEdit}
        onDelete={onDelete}
        onValueChange={setExpandedItems}
        onTogglePaidStatus={onTogglePaidStatus}
        updatePayment={updatePayment}
      />
    </ContentContainer>
  );
}
