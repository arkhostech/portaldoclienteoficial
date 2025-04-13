
import { DollarSign } from "lucide-react";

export function EmptyPaymentsState() {
  return (
    <div className="text-center py-8">
      <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
      <h3 className="mt-2 text-lg font-semibold">Nenhum pagamento agendado</h3>
      <p className="text-muted-foreground">
        Agende um novo pagamento para começar.
      </p>
    </div>
  );
}
