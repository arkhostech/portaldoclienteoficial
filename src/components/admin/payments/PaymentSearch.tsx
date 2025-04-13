
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaymentSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function PaymentSearch({ searchTerm, setSearchTerm }: PaymentSearchProps) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar pagamentos..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
