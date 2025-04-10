
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className="text-4xl font-bold">27</span>
            <span className="ml-2 text-sm text-green-600">+12% mês</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Processos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className="text-4xl font-bold">42</span>
            <span className="ml-2 text-sm text-amber-600">+5% mês</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className="text-4xl font-bold">78%</span>
            <span className="ml-2 text-sm text-green-600">+3% mês</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
