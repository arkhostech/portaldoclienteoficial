
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

interface PageHeaderProps {
  openDialog: () => void;
}

export function PageHeader({ openDialog }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos Agendados</h1>
        <p className="text-muted-foreground">
          Gerencie os pagamentos agendados para os clientes.
        </p>
      </div>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto" onClick={openDialog}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Agendar Novo Pagamento
        </Button>
      </DialogTrigger>
    </div>
  );
}
