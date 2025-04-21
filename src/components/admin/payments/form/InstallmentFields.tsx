import { Control, useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InstallmentFrequency } from "./types";
import { useState, useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useInstallmentCalculation } from "./useInstallmentCalculation";
import { InstallmentWarning, InstallmentZeroAlert } from "./InstallmentWarning";
import { InstallmentDisabledAlert } from "./InstallmentDisabledAlert";

interface InstallmentFieldsProps {
  control: Control<any>;
  disabled: boolean;
  values: {
    enable_installments?: boolean;
    installments_count?: number;
    amount?: string;
    total_amount?: string;
  };
}

export function InstallmentFields({ control, disabled, values }: InstallmentFieldsProps) {
  const [showWarning, setShowWarning] = useState(false);

  const { setValue } = useFormContext();
  const total_amount = useWatch({ name: "total_amount", control });
  const amount = useWatch({ name: "amount", control });
  const installments_count = useWatch({ name: "installments_count", control });
  const enable_installments = useWatch({ name: "enable_installments", control });

  const { parcelValue, setParcelValue } = useInstallmentCalculation({
    enable_installments,
    installments_count,
    amount,
    total_amount,
    setValue
  });

  const handleInstallmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(event.target.value, 10);
    if (count > 24) setShowWarning(true);
    else setShowWarning(false);
  };

  return (
    <>
      <FormField
        control={control}
        name="enable_installments"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Habilitar Parcelamento</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <InstallmentDisabledAlert amount={amount} total_amount={total_amount} />

      {values.enable_installments && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-semibold">Detalhes do Parcelamento</h4>

          <FormField
            control={control}
            name="installments_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas*</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Ex: 12"
                    {...field}
                    onChange={(e) => {
                      handleInstallmentsChange(e);
                      field.onChange(parseInt(e.target.value, 10) || 0);
                    }}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <InstallmentWarning showWarning={showWarning} />
          <InstallmentZeroAlert enable_installments={values.enable_installments} installments_count={values.installments_count} />

          <FormField
            control={control}
            name="installment_frequency"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Periodicidade*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value as string}
                    className="flex space-x-4"
                    disabled={disabled}
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="weekly" />
                      </FormControl>
                      <FormLabel className="font-normal">Semanal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="biweekly" />
                      </FormControl>
                      <FormLabel className="font-normal">Quinzenal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="monthly" />
                      </FormControl>
                      <FormLabel className="font-normal">Mensal</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="installment_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Parcela*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 250.00"
                    {...field}
                    value={parcelValue !== "" ? parcelValue : field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setParcelValue(e.target.value);
                    }}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="first_installment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Primeira Parcela*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={disabled}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
}
