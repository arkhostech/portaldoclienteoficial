
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Simple validation
      if (email && password) {
        toast.success("Login bem-sucedido!");
        navigate("/dashboard");
      } else {
        toast.error("Por favor, preencha todos os campos.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Portal do Cliente</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Senha"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <a href="#" className="text-brand-600 hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <div className="flex items-center text-xs text-muted-foreground">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Conexão segura e encriptada
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Image and information */}
      <div className="hidden md:flex flex-1 bg-brand-600 text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800 opacity-90"></div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold">Bem-vindo ao Portal do Cliente</h1>
          <p className="text-xl">Gerencie seus processos, documentos e pagamentos em um só lugar.</p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Acesso Seguro</h3>
                <p className="text-white/80">Sua informação é protegida com criptografia de ponta a ponta.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Comunicação Centralizada</h3>
                <p className="text-white/80">Todas as suas mensagens e documentos em um só lugar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
