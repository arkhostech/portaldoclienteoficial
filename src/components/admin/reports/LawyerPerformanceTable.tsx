
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LawyerPerformanceTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por Advogado</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Advogado</TableHead>
              <TableHead>Processos</TableHead>
              <TableHead>Concluídos</TableHead>
              <TableHead>Taxa de Sucesso</TableHead>
              <TableHead>Clientes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Dr. Roberto Almeida</TableCell>
              <TableCell>15</TableCell>
              <TableCell>12</TableCell>
              <TableCell>80%</TableCell>
              <TableCell>8</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dra. Carla Mendes</TableCell>
              <TableCell>12</TableCell>
              <TableCell>10</TableCell>
              <TableCell>83%</TableCell>
              <TableCell>7</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dr. Paulo Santos</TableCell>
              <TableCell>9</TableCell>
              <TableCell>6</TableCell>
              <TableCell>67%</TableCell>
              <TableCell>6</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dra. Juliana Costa</TableCell>
              <TableCell>6</TableCell>
              <TableCell>5</TableCell>
              <TableCell>83%</TableCell>
              <TableCell>5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LawyerPerformanceTable;
