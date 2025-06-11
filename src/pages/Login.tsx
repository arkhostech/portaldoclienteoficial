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
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    // Se user existe, mostrar skeleton por um tempo antes de redirecionar
    if (!loading && user) {
      setShowSkeleton(true);
      
      const timer = setTimeout(() => {
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 500); // 500ms de skeleton antes do redirecionamento
      
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn(email, password);
      // Redirection will be handled by the useEffect above after auth state changes
    } catch (error: any) {
      console.error(error);
      setError("Credenciais inválidas ou ocorreu um erro ao tentar fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || showSkeleton) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side skeleton */}
        <div className="hidden md:flex flex-1 bg-gray-100 p-12 flex-col justify-center">
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <Skeleton className="h-48 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full" />
            
            <div className="mt-12 space-y-4">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side skeleton */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="text-center">
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <Skeleton className="h-4 w-40" />
            </CardFooter>
          </Card>
        </div>
        
        {/* Loading indicator */}
        <div className="fixed bottom-6 right-6 bg-white rounded-full p-3 shadow-lg border">
          <div className="h-6 w-6 border-2 border-t-[#053D38] border-gray-200 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Don't render the form if user is already logged in
  if (user) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%)"
    }}>
      {/* Formas geométricas decorativas */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#053D38] opacity-5 rounded-full animate-float-slow z-0" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#A3CCAB] opacity-10 rounded-full animate-float-medium z-0" />
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#34675C] opacity-5 rounded-full animate-float-fast z-0" style={{transform: 'translate(-50%, -50%)'}} />
      <div className="flex flex-col items-center justify-center w-full z-10">
        <Card className="w-full max-w-[420px] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(5,61,56,0.15)] p-0 border-0">
          <CardHeader className="text-center pt-12 pb-4 px-10">
            <div className="mb-10 flex flex-col items-center">
              <span className="text-4xl mb-2" style={{color:'#053D38'}} role="img" aria-label="user">👤</span>
              <span className="text-[32px] font-bold text-[#14140F] font-sans leading-tight">Portal do Cliente</span>
              <span className="text-[16px] text-[#34675C] font-medium mt-2">Acesse sua conta</span>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-0 pt-2">
            {error && (
              <div className="mb-4 text-[15px] font-medium text-[#F26800] text-center bg-[#fff7f0] rounded-lg py-2 px-3">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="mb-2">
                <label className="block text-[#14140F] font-semibold mb-3 text-left text-[15px]">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#34675C] opacity-80 select-none pointer-events-none">📧</span>
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    className="pl-12 py-4 bg-white border-2 border-[#e5e7eb] focus:border-[#053D38] focus:ring-2 focus:ring-[#A3CCAB]/40 focus:outline-none rounded-lg text-[16px] placeholder:text-[#34675C]/70 font-normal mb-0 transition-all duration-200 shadow-none focus:shadow-[0_0_0_3px_rgba(163,204,171,0.15)]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-[#14140F] font-semibold mb-3 text-left text-[15px]">Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#34675C] opacity-80 select-none pointer-events-none">🔒</span>
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    className="pl-12 py-4 bg-white border-2 border-[#e5e7eb] focus:border-[#053D38] focus:ring-2 focus:ring-[#A3CCAB]/40 focus:outline-none rounded-lg text-[16px] placeholder:text-[#34675C]/70 font-normal mb-0 transition-all duration-200 shadow-none focus:shadow-[0_0_0_3px_rgba(163,204,171,0.15)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#053D38] to-[#34675C] hover:scale-105 text-white font-semibold py-4 rounded-lg text-[16px] mt-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : <><span>Entrar</span><span className="text-lg ml-1">→</span></>}
              </Button>
            </form>
            <div className="flex justify-between items-center mt-6 mb-2">
              <a href="/forgot-password" className="text-[#34675C] hover:text-[#053D38] text-[15px] font-medium transition-colors duration-200">Esqueceu a senha?</a>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 pt-2 pb-8 px-10">
          </CardFooter>
        </Card>
      </div>
      {/* Animações flutuantes */}
      <style>{`
        @keyframes float-slow { 0%{transform:translateY(0);} 50%{transform:translateY(20px);} 100%{transform:translateY(0);} }
        @keyframes float-medium { 0%{transform:translateY(0);} 50%{transform:translateY(-16px);} 100%{transform:translateY(0);} }
        @keyframes float-fast { 0%{transform:translateY(0);} 50%{transform:translateY(12px);} 100%{transform:translateY(0);} }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Login; 