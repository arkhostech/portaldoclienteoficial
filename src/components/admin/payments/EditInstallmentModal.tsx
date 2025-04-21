
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";

interface EditInstallmentModalProps {
  open: boolean;
  onClose: () => void;
  payment: {
    id: string;
    amount: string;
    due_date: string;
  } | null;
  onSave: (id: string, data: { amount: string; due_date: string }) => void;
}

export function EditInstallmentModal({ open, onClose, payment, onSave }: EditInstallmentModalProps) {
  const [amount, setAmount] = useState(payment?.amount || "");
  const [dueDate, setDueDate] = useState(payment?.due_date || "");

  // Atualiza o form ao reabrir para editar outro pagamento
  // Esse efeito garante que os valores iniciais estejam corretos sempre que abrir
  React.useEffect(() => {
    setAmount(payment?.amount || "");
    setDueDate(payment?.due_date || "");
  }, [payment]);

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Parcela</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSave(payment.id, { amount, due_date: dueDate });
          }}
        >
          <div>
            <label className="block mb-1 text-sm font-medium">Valor</label>
            <Input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              type="text"
              required
              pattern="^\$?\d+(\.\d{1,2})?$"
              placeholder="Ex: 250.00"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Data de Vencimento</label>
            <Input
              value={dueDate ? format(new Date(dueDate), "yyyy-MM-dd") : ""}
              onChange={e => setDueDate(e.target.value)}
              type="date"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
