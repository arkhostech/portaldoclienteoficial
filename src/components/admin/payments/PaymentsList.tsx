
import { Client } from "@/services/clients/types";
import { ScheduledPayment } from "@/hooks/payments/usePayments";
import { PaymentsAccordion } from "./PaymentsAccordion";
import { NoSearchResults } from "./NoSearchResults";
import { highlightMatch } from "./PaymentsUtils";

interface PaymentsListProps {
  groupedPayments: Record<string, ScheduledPayment[]>;
  filteredClientIds: string[];
  expandedItems: string[];
  clients: Client[];
  searchTerm: string;
  onEdit: (payment: ScheduledPayment) => void;
  onDelete: (paymentId: string) => void;
  onValueChange: (value: string[]) => void;
  onTogglePaidStatus: (id: string, paid: boolean) => void;
  updatePayment: (id: string, values: { amount: string; due_date: string }) => void;
}

export function PaymentsList({
  groupedPayments,
  filteredClientIds,
  expandedItems,
  clients,
  searchTerm,
  onEdit,
  onDelete,
  onValueChange,
  onTogglePaidStatus,
  updatePayment,
}: PaymentsListProps) {
  if (filteredClientIds.length === 0) {
    return <NoSearchResults />;
  }

  return (
    <PaymentsAccordion 
      groupedPayments={groupedPayments}
      sortedClientIds={filteredClientIds}
      expandedItems={expandedItems}
      clients={clients}
      searchTerm={searchTerm}
      onEdit={onEdit}
      onDelete={onDelete}
      highlightMatch={highlightMatch}
      onValueChange={onValueChange}
      onTogglePaidStatus={onTogglePaidStatus}
      updatePayment={updatePayment}
    />
  );
}
