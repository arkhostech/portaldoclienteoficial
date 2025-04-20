
export const LoadingState = () => (
  <div className="p-4 text-center text-muted-foreground">
    Carregando dados...
  </div>
);

export const EmptyState = ({ message }: { message: string }) => (
  <div className="p-4 text-center text-muted-foreground">
    {message}
  </div>
);
