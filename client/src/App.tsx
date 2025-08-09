import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useSessionManager } from "@/hooks/useSessionManager";
import { SessionWarningDialog } from "@/components/auth/SessionWarningDialog";
import { LoadingSpinner } from "@/components/animations/LoadingAnimations";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import { AuthPage } from "@/pages/auth";
import { LandingPage } from "@/pages/LandingPage";
import { ProfilePage } from "@/pages/profile";
import { UserManagementPage } from "@/pages/admin/users";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Estimation from "@/pages/estimation";
import Materials from "@/pages/materials";
import Chatbot from "@/pages/chatbot";
import { ProtectedRoute, AdminRoute, ClientRoute } from "@/components/auth/ProtectedRoute";

// Admin Pages
import CategoriesPage from "@/pages/admin/categories";
import ClientRequestsPage from "@/pages/admin/requests";
import AdminQuotationsPage from "@/pages/admin/quotations";
import AdminAnalyticsPage from "@/pages/admin/analytics";
import AdminNotificationsPage from "@/pages/admin/notifications";
import EnhancedUsersPage from "@/pages/admin/enhanced-users";
import SystemControl from "@/pages/admin/SystemControl";
import SecurityAudit from "@/pages/admin/SecurityAudit";
import FinancialManagement from "@/pages/admin/FinancialManagement";

// Nouveaux modules admin avancés
import AnalyticsEnhancedPage from "@/pages/admin/analytics-enhanced";
import PermissionManagementPage from "@/pages/admin/permission-management";
import NotificationCenterPage from "@/pages/admin/notification-center";
import SystemMonitoringPage from "@/pages/admin/system-monitoring";

// Client Pages
import ClientProjectsPage from "@/pages/client/projects";
import ClientRequestPage from "@/pages/client/request";
import ClientQuotationsPage from "@/pages/client/quotations";
import ClientDocumentsPage from "@/pages/client/documents";
import ClientPaymentsPage from "@/pages/client/payments";
import ClientProfilePage from "@/pages/client/profile";

function Router() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Gestion de session uniquement si authentifié
  const sessionManager = useSessionManager({
    warningTime: 5,  // 5 minutes d'avertissement
    idleTime: 30,    // 30 minutes d'inactivité max
    checkInterval: 60000 // Vérification chaque minute
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner size="lg" color="#2563EB" />
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  // Handle public routes that don't require authentication
  if (!isAuthenticated) {
    // Show auth page for /auth route
    if (location === '/auth') {
      return <AuthPage />;
    }
    
    // Show landing page for all other routes when not authenticated
    return (
      <LandingPage 
        onRegister={() => navigate('/auth?mode=register')}
        onLogin={() => navigate('/auth?mode=login')}
      />
    );
  }

  // If authenticated, show protected routes with session management
  return (
    <>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Route>
          <Route path="/projects">
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          </Route>
          <Route path="/estimation">
            <ProtectedRoute>
              <Estimation />
            </ProtectedRoute>
          </Route>
          <Route path="/materials">
            <ProtectedRoute>
              <Materials />
            </ProtectedRoute>
          </Route>
          <Route path="/chatbot">
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/users">
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/categories">
            <AdminRoute>
              <CategoriesPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/requests">
            <AdminRoute>
              <ClientRequestsPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/quotations">
            <AdminRoute>
              <AdminQuotationsPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/analytics">
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/notifications">
            <AdminRoute>
              <AdminNotificationsPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/enhanced-users">
            <AdminRoute>
              <EnhancedUsersPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/system-control">
            <AdminRoute>
              <SystemControl />
            </AdminRoute>
          </Route>
          <Route path="/admin/security-audit">
            <AdminRoute>
              <SecurityAudit />
            </AdminRoute>
          </Route>
          <Route path="/admin/financial-management">
            <AdminRoute>
              <FinancialManagement />
            </AdminRoute>
          </Route>
          
          {/* Nouveaux modules admin avancés */}
          <Route path="/admin/analytics-enhanced">
            <AdminRoute>
              <AnalyticsEnhancedPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/permission-management">
            <AdminRoute>
              <PermissionManagementPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/notification-center">
            <AdminRoute>
              <NotificationCenterPage />
            </AdminRoute>
          </Route>
          <Route path="/admin/system-monitoring">
            <AdminRoute>
              <SystemMonitoringPage />
            </AdminRoute>
          </Route>
          
          {/* Client routes */}
          <Route path="/client/projects">
            <ClientRoute>
              <ClientProjectsPage />
            </ClientRoute>
          </Route>
          <Route path="/client/request">
            <ClientRoute>
              <ClientRequestPage />
            </ClientRoute>
          </Route>
          <Route path="/client/quotations">
            <ClientRoute>
              <ClientQuotationsPage />
            </ClientRoute>
          </Route>
          <Route path="/client/documents">
            <ClientRoute>
              <ClientDocumentsPage />
            </ClientRoute>
          </Route>
          <Route path="/client/payments">
            <ClientRoute>
              <ClientPaymentsPage />
            </ClientRoute>
          </Route>
          <Route path="/client/profile">
            <ClientRoute>
              <ClientProfilePage />
            </ClientRoute>
          </Route>
          
          {/* Auth route accessible when not authenticated */}
          <Route path="/auth" component={AuthPage} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
      
      {/* Session Warning Dialog */}
      <SessionWarningDialog
        isOpen={sessionManager.showWarning}
        timeLeft={sessionManager.timeLeft}
        onExtend={sessionManager.extendSession}
        onLogout={sessionManager.handleAutoLogout}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="housy-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
