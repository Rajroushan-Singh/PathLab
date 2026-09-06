import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageLoader from "@/components/PageLoader";
import ProtectedRoute from "@/components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Overview = lazy(() => import("./pages/Overview"));
const ReportsVault = lazy(() => import("./pages/ReportsVault"));
const PatientsPage = lazy(() => import("./pages/PatientsPage"));
const CreateRequestPage = lazy(() => import("./pages/CreateRequestPage"));
const ConsentRequestsPage = lazy(() => import("./pages/ConsentRequestsPage"));
const SendReportsPage = lazy(() => import("./pages/SendReportsPage"));
const UserDetailPage = lazy(() => import("./pages/UserDetailPage"));
const LegacyUserRedirect = lazy(() => import("./components/LegacyUserRedirect"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
            <Route path="/create-request" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
            <Route path="/consent-requests" element={<ProtectedRoute><ConsentRequestsPage /></ProtectedRoute>} />
            <Route path="/reports-vault" element={<ProtectedRoute><ReportsVault /></ProtectedRoute>} />
            <Route path="/send-reports" element={<ProtectedRoute><SendReportsPage /></ProtectedRoute>} />
            <Route path="/patient/:ref" element={<ProtectedRoute><UserDetailPage /></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute><LegacyUserRedirect /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
