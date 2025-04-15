
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CasesSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const CasesSearch = ({ value, onChange }: CasesSearchProps) => {
  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar processo..."
        className="pl-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default CasesSearch;
