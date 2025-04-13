
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Client } from "@/services/clients/types";
import { cn } from "@/lib/utils";
import { Control } from "react-hook-form";

// Client selector field
export function ClientSelectField({ 
  control, 
  clients, 
  disabled 
}: { 
  control: Control<any>; 
  clients: Client[]; 
  disabled: boolean;
}) {
  return (
    <FormField
      control={control}
      name="client_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cliente*</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Payment title field
export function TitleField({ control, disabled }: { control: Control<any>; disabled: boolean }) {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Título do Pagamento*</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Taxa de Processo" {...field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Payment amount field
export function AmountField({ control, disabled }: { control: Control<any>; disabled: boolean }) {
  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor*</FormLabel>
          <FormControl>
            <Input placeholder="Ex: 500.00" {...field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Due date field with calendar popup
export function DueDateField({ control, disabled }: { control: Control<any>; disabled: boolean }) {
  return (
    <FormField
      control={control}
      name="due_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Data de Vencimento*</FormLabel>
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
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Description field
export function DescriptionField({ control, disabled }: { control: Control<any>; disabled: boolean }) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Detalhes adicionais sobre o pagamento..."
              {...field}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Submit button
export function SubmitButton({ 
  isSubmitting, 
  isEditMode 
}: { 
  isSubmitting: boolean; 
  isEditMode: boolean;
}) {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Salvando...
          </>
        ) : isEditMode ? (
          "Atualizar Pagamento"
        ) : (
          "Agendar Pagamento"
        )}
      </Button>
    </div>
  );
}
