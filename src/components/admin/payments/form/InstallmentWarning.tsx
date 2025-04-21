
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InstallmentWarning({ showWarning }: { showWarning: boolean }) {
  if (!showWarning) return null;
  return (
    <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-200">
      <AlertDescription>
        O número de parcelas excede 24 meses. Isso é permitido, mas considere revisar.
      </AlertDescription>
    </Alert>
  );
}

export function InstallmentZeroAlert({ enable_installments, installments_count }: { enable_installments: boolean, installments_count: number }) {
  if (!enable_installments || installments_count !== 0) return null;
  return (
    <Alert variant="warning" className="bg-yellow-50 text-yellow-800 border-yellow-200">
      <AlertDescription>
        Por favor, defina o número de parcelas maior que zero.
      </AlertDescription>
    </Alert>
  );
}
