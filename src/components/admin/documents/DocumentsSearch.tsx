
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocumentsSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function DocumentsSearch({ searchTerm, setSearchTerm }: DocumentsSearchProps) {
  return (
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por cliente ou documento..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
