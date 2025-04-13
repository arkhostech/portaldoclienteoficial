
import { Client } from "@/services/clients/types";
import { ScheduledPayment } from "@/hooks/payments/usePayments";
import { PaymentsAccordion } from "./PaymentsAccordion";
import { PaymentsAccordionHeader } from "./PaymentsAccordionHeader";
import { highlightMatch } from "./PaymentsUtils";
import { LoadingPayments } from "./LoadingPayments";
import { EmptyPaymentsState } from "./EmptyPaymentsState";
import { NoSearchResults } from "./NoSearchResults";

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
}: PaymentsContentProps) {
  if (isLoading) {
    return <LoadingPayments />;
  }

  if (payments.length === 0) {
    return <EmptyPaymentsState />;
  }

  return (
    <div>
      <PaymentsAccordionHeader 
        toggleAllAccordions={toggleAllAccordions}
        expandedItems={expandedItems}
        sortedClientIds={sortedClientIds}
      />
      
      {filteredClientIds.length === 0 ? (
        <NoSearchResults />
      ) : (
        <PaymentsAccordion 
          groupedPayments={groupedPayments}
          sortedClientIds={filteredClientIds}
          expandedItems={expandedItems}
          clients={clients}
          searchTerm={searchTerm}
          onEdit={onEdit}
          onDelete={onDelete}
          highlightMatch={highlightMatch}
        />
      )}
    </div>
  );
}
