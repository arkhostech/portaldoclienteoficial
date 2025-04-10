
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Documents from "./pages/Documents";
import Payments from "./pages/Payments";
import Knowledge from "./pages/Knowledge";
import NotFound from "./pages/NotFound";
import Clients from "./pages/admin/Clients";
import AdminDocuments from "./pages/admin/Documents";
import Cases from "./pages/admin/Cases";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/cases" element={<Cases />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
