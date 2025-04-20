import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { ToastProvider } from "@/hooks/use-toast";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Documents from "./pages/Documents";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import Clients from "./pages/admin/Clients";
import AdminDocuments from "./pages/admin/Documents";
import AdminPayments from "./pages/admin/Payments";
import Cases from "./pages/admin/Cases";
import ClientStages from "./pages/admin/ClientStages";
import ClientDocuments from "./pages/admin/ClientDocuments";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/clients" element={<Clients />} />
              <Route path="/admin/clients/:clientId/documents" element={<ClientDocuments />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/cases" element={<Cases />} />
              <Route path="/admin/client-stages" element={<ClientStages />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
