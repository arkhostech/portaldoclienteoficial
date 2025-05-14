
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ToastProvider } from "@/hooks/use-toast";

// Carregamento assíncrono das páginas para melhor performance
const Index = lazy(() => import("./pages/Index"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Documents = lazy(() => import("./pages/Documents"));
const Messages = lazy(() => import("./pages/Messages"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Clients = lazy(() => import("./pages/admin/Clients"));
const AdminDocuments = lazy(() => import("./pages/admin/Documents"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const Cases = lazy(() => import("./pages/admin/Cases"));
const ClientStages = lazy(() => import("./pages/admin/ClientStages"));
const ClientDocuments = lazy(() => import("./pages/admin/ClientDocuments"));
const Settings = lazy(() => import("./pages/admin/Settings"));

// Configuração do React Query com opções otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de carregamento para Suspense
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-16 w-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/clients" element={<Clients />} />
                <Route path="/admin/clients/:clientId/documents" element={<ClientDocuments />} />
                <Route path="/admin/documents" element={<AdminDocuments />} />
                <Route path="/admin/cases" element={<Cases />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/client-stages" element={<ClientStages />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
