
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
import { Lock, Mail, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validação simples
      if (!email || !password || !fullName) {
        setError("Por favor, preencha todos os campos.");
        setIsLoading(false);
        return;
      }

      // Validação da chave de administrador
      if (adminKey !== "legacygroup2023") {
        setError("Chave de administrador inválida.");
        setIsLoading(false);
        return;
      }

      console.log("Criando conta de administrador:", {
        email,
        fullName,
        isAdmin: true,
        passwordLength: password.length
      });
      
      await signUp(email, password, fullName, true);
      
      toast.success("Administrador cadastrado com sucesso! Por favor, confira seu email para verificar sua conta.");
      
      // Resetar o formulário
      setEmail("");
      setPassword("");
      setFullName("");
      setAdminKey("");
      
      // Redirecionar após um breve atraso
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      console.error("Erro no cadastro de administrador:", error);
      setError(error.message || "Ocorreu um erro ao criar a conta de administrador.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Cadastro de Administrador</CardTitle>
            <CardDescription>
              Crie uma conta de administrador para o Portal do Cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Nome Completo"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
              <div className="space-y-2">
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Chave de Administrador"
                    className="pl-10"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <a href="/" className="text-accent hover:underline">
                Voltar para login
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
      <div className="hidden md:flex flex-1 bg-secondary text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/80 opacity-90"></div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold">Portal de Administração</h1>
          <p className="text-xl">Crie uma conta de administrador para gerenciar clientes, documentos e processos.</p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Acesso Administrativo</h3>
                <p className="text-white/80">Gerencie todos os clientes e seus dados.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignUp;
