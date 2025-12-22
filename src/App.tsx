import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import InstitutePage from "./pages/InstitutePage";
import SubjectsPage from "./pages/SubjectsPage";
import TransportPage from "./pages/TransportPage";
import SystemPaymentPage from "./pages/SystemPaymentPage";
import SMSPage from "./pages/SMSPage";
import SMSPaymentPage from "./pages/SMSPaymentPage";
import AdvertisementPage from "./pages/AdvertisementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/institute" element={<InstitutePage />} />
            <Route path="/dashboard/subjects" element={<SubjectsPage />} />
            <Route path="/dashboard/transport" element={<TransportPage />} />
            <Route path="/dashboard/system-payment" element={<SystemPaymentPage />} />
            <Route path="/dashboard/sms" element={<SMSPage />} />
            <Route path="/dashboard/sms-payment" element={<SMSPaymentPage />} />
            <Route path="/dashboard/advertisement" element={<AdvertisementPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
