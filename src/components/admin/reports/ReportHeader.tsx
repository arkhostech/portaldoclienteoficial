
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const ReportHeader = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
      <div>
        <h2 className="text-3xl font-bold">Relatórios</h2>
        <p className="text-muted-foreground">
          Análise de dados e estatísticas do escritório
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Exportar dados
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Relatório completo
        </Button>
      </div>
    </div>
  );
};

export default ReportHeader;
