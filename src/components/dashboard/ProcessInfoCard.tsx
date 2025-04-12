
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessInfoCardProps {
  processType?: string;
  status?: string;
}

const ProcessInfoCard = ({ processType, status }: ProcessInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Processo</CardTitle>
      </CardHeader>
      <CardContent>
        {processType ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Tipo de Processo</span>
                <span className="font-medium">{processType}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs w-fit ${
                  status === "active" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              Nenhuma informação de processo disponível no momento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessInfoCard;
