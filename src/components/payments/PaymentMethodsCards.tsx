
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign } from "lucide-react";

export default function PaymentMethodsCards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="border rounded-lg p-4 flex items-center">
            <div className="mr-4 bg-blue-100 rounded-full p-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Cartão de Crédito</h3>
              <p className="text-sm text-muted-foreground">
                Parcelamento em até 12x
              </p>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center">
            <div className="mr-4 bg-green-100 rounded-full p-2">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Transferência Bancária</h3>
              <p className="text-sm text-muted-foreground">
                Pix ou TED
              </p>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center">
            <div className="mr-4 bg-purple-100 rounded-full p-2">
              <svg 
                className="h-6 w-6 text-purple-600" 
                fill="currentColor" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
              >
                <path d="M19.54,8.4h0a.5.5,0,1,0,.5.5A.5.5,0,0,0,19.54,8.4Z" />
                <path d="M18.74,6h1.61a.4.4,0,0,0,.4-.4V4a.4.4,0,0,0-.4-.4H18.74a.4.4,0,0,0-.4.4V5.6A.4.4,0,0,0,18.74,6Z" />
                <path d="M6.25,14a.5.5,0,1,0,.5.5A.5.5,0,0,0,6.25,14Z" />
                <path d="M11.62,16.4a.5.5,0,1,0,.5.5A.5.5,0,0,0,11.62,16.4Z" />
                <path d="M16.42,3.1h3a1.29,1.29,0,0,1,1.3,1.29v5.23A1.27,1.27,0,0,1,20.16,11a1.28,1.28,0,0,1-1.29-.09,1.31,1.31,0,0,1-.57-1.09V4.46H16.58a1.42,1.42,0,0,0-1.25.75L10.86,13a1.41,1.41,0,0,0,0,1.41,1.42,1.42,0,0,0,1.21.68h4.36v3.38A1.3,1.3,0,0,1,15.14,19.8h-3a1.29,1.29,0,0,1-1.3-1.28V13.25a1.28,1.28,0,0,1,.56-1.09,1.26,1.26,0,0,1,1.28-.09,1.3,1.3,0,0,1,.58,1.09V18.3H15v-3.3a1.41,1.41,0,0,0-.45-1,1.43,1.43,0,0,0-1-.43H9.14l4.47-7.76a1.41,1.41,0,0,0,0-1.41,1.42,1.42,0,0,0-1.21-.67H7.94a1.42,1.42,0,0,0-1.25.75L2.22,11.22a1.41,1.41,0,0,0,0,1.41,1.42,1.42,0,0,0,1.21.67H7.26v5.22a1.29,1.29,0,0,1-1.3,1.28h-3A1.29,1.29,0,0,1,1.64,18.5V4.39A1.29,1.29,0,0,1,2.94,3.1h13.4Zm-5.42,11h3.94V10.79H9.64L6,15.88a.44.44,0,0,0,0,.44.46.46,0,0,0,.38.21H9.93v2.17a.41.41,0,0,0,.39.4A.39.39,0,0,0,10.7,19a.41.41,0,0,0,.11-.28V16.53h.19Zm8.73-5.73h.19V5.79H13.11L9.5,10.88a.44.44,0,0,0,0,.44.46.46,0,0,0,.38.21h3.59v2.17a.4.4,0,0,0,.57.37.39.39,0,0,0,.23-.37V11.53h3.94V8.35Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">PayPal</h3>
              <p className="text-sm text-muted-foreground">
                Pagamento internacional
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
