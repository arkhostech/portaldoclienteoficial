import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { CentralizedRealtimeProvider } from "@/contexts/centralizedRealtime";
import { ToastProvider } from "@/hooks/toast/toast-context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LogoutHandler } from "@/components/LogoutHandler";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Messages from "@/pages/Messages";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminClients from "@/pages/admin/Clients";
import AdminMessages from "@/pages/admin/Messages";
import AdminDocuments from "@/pages/admin/Documents";
import AdminClientDocuments from "@/pages/admin/ClientDocuments";
import AdminClientStages from "@/pages/admin/ClientStages";
import AdminSettings from "@/pages/admin/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <CentralizedRealtimeProvider>
                <NotificationProvider>
                  <LogoutHandler />
                  <Routes>
                  {/* Unified Login Route */}
                  <Route path="/" element={<Login />} />
                  
                  {/* Client Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/messages" element={<Messages />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/clients" element={<AdminClients />} />
                  <Route path="/admin/messages" element={<AdminMessages />} />
                  <Route path="/admin/documents" element={<AdminDocuments />} />
                  <Route path="/admin/documents/:clientId" element={<AdminClientDocuments />} />
                  <Route path="/admin/client-stages" element={<AdminClientStages />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  
                  {/* Legacy routes - redirect to main login */}
                  <Route path="/admin-login" element={<Navigate to="/" replace />} />
                  
                  {/* Catch all - redirect to login */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </NotificationProvider>
              </CentralizedRealtimeProvider>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
