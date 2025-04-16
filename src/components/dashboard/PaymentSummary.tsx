
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign } from "lucide-react";

export const PaymentSummary = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-base">Resumo de Pagamentos</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {/* Payment Summary section */}
          <div className="flex flex-col">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Próximo:</span>
                  <span className="font-medium text-sm">15/06/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Valor:</span>
                  <span className="font-medium text-sm text-green-600">R$ 1.500,00</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">Total aberto:</span>
                  <span className="font-semibold text-sm">R$ 4.500,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
