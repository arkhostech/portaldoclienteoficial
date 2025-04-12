
interface DocumentsEmptyProps {
  searchTerm: string;
}

export function DocumentsEmpty({ searchTerm }: DocumentsEmptyProps) {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground">
        {searchTerm ? "Nenhum documento encontrado." : "Nenhum documento cadastrado."}
      </p>
    </div>
  );
}
