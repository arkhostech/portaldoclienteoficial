
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentContactDialog({
  open,
  onOpenChange,
}: PaymentContactDialogProps) {
  const handleContact = () => {
    window.open("http://wa.me/16892415570", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Realizar Pagamento</DialogTitle>
          <DialogDescription className="pt-4 text-center text-base">
            Para fazer um pagamento, entre em contato com o departamento financeiro da Legacy Imigra
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button onClick={handleContact}>
            Entrar em Contato
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
