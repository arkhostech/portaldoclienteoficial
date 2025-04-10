
import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        // If logged in but not admin, show error and logout
        toast.error("Apenas administradores podem acessar este portal.");
        // Let the AuthContext handle logout and redirection
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn(email, password);
      // Role checking and redirects are handled in AuthContext
    } catch (error: any) {
      console.error(error);
      setError("Credenciais inválidas ou você não tem permissão de administrador.");
    } finally {
      setIsLoading(false);
    }
  };

  // If loading, don't render the form yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-t-[#eac066] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If already logged in, let the useEffect handle redirection
  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline"
          className="bg-white hover:bg-gray-100"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Portal do Cliente
        </Button>
      </div>

      {/* Left side - Admin Information */}
      <div className="hidden md:flex flex-1 bg-[#111111] text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#222222] to-[#111111] opacity-90"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/f5a3246c-a214-45b7-aa04-6049dbbeb4f8.png" 
              alt="Logo da empresa" 
              className="h-48 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold">Portal Administrativo</h1>
          <p className="text-xl">Acesso exclusivo para administradores do sistema.</p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-[#EAC066] rounded-full p-2">
                <ShieldCheck className="h-6 w-6 text-[#111111]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                <p className="text-white/80">Apenas pessoal autorizado pode entrar neste portal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Login de Administrador</CardTitle>
            <CardDescription>
              Acesse o painel administrativo do sistema
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
                className="w-full bg-[#EAC066] hover:bg-[#d9af5c] text-[#111111]"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Entrar como Administrador"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <div className="flex items-center text-xs text-muted-foreground">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Conexão segura e encriptada
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
