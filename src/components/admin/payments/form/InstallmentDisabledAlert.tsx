
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InstallmentDisabledAlert({ amount, total_amount }: { amount: string, total_amount: string }) {
  if (parseFloat(amount) !== parseFloat(total_amount)) return null;
  return (
    <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200 mt-2">
      <AlertDescription>
        O cliente irá pagar o valor total à vista. O parcelamento está desabilitado.
      </AlertDescription>
    </Alert>
  );
}
