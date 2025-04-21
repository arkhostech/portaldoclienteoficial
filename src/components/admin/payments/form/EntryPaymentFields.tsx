
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface EntryPaymentFieldsProps {
  control: Control<any>;
  disabled: boolean;
}

export function EntryPaymentFields({ control, disabled }: EntryPaymentFieldsProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <h4 className="text-sm font-semibold">Entrada (Pagamento Inicial)</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <FormField
          control={control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Entrada*</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 500.00" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Paid Checkbox */}
        <FormField
          control={control}
          name="is_paid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-end space-x-3 space-y-0 mt-8">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Pago
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
