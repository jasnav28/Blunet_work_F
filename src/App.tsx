import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { TasksPage } from './pages/TasksPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { MarketingDashboard } from './pages/MarketingDashboard';
import { LeadImporterPage } from './pages/LeadImporterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeesPage } from './pages/EmployeesPage';
import { MarketingTeamPage } from './pages/MarketingTeamPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { FounderDashboard } from './pages/FounderDashboard';
import { HiddenAdminPage } from './pages/HiddenAdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'MARKETING_HEAD') return <Navigate to="/marketing" replace />;
    if (user.role === 'FOUNDER') return <Navigate to="/founder" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'MARKETING_HEAD') return <Navigate to="/marketing" replace />;
  if (user.role === 'FOUNDER') return <Navigate to="/founder" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Employee Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Tasks */}
            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}>
                  <TasksPage />
                </ProtectedRoute>
              }
            />

            {/* Resources */}
            <Route
              path="/resources"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />

            {/* Marketing Head Overview & Caller */}
            <Route
              path="/marketing"
              element={
                <ProtectedRoute allowedRoles={['MARKETING_HEAD', 'ADMIN', 'FOUNDER']}>
                  <MarketingDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute allowedRoles={['MARKETING_HEAD', 'ADMIN']}>
                  <MarketingDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Dedicated Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Employees Management Page */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD', 'FOUNDER']}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Marketing Team & Lead Importer Page */}
            <Route
              path="/marketing-team"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD']}>
                  <MarketingTeamPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leads/import"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD']}>
                  <LeadImporterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Founder Routes */}
            <Route
              path="/founder"
              element={
                <ProtectedRoute allowedRoles={['FOUNDER', 'ADMIN']}>
                  <FounderDashboard />
                </ProtectedRoute>
              }
            />

            {/* Hidden Secret Admin Anvi Routes */}
            <Route path="/8328246413" element={<HiddenAdminPage />} />
            <Route path="/8328246413/admin" element={<HiddenAdminPage />} />
            <Route path="/8328246413/employees" element={<AppLayout><EmployeesPage /></AppLayout>} />
            <Route path="/8328246413/marketing-team" element={<AppLayout><MarketingTeamPage /></AppLayout>} />
            <Route path="/8328246413/leads/import" element={<AppLayout><LeadImporterPage /></AppLayout>} />
            <Route path="/8328246413/tasks" element={<AppLayout><TasksPage /></AppLayout>} />
            <Route path="/8328246413/resources" element={<AppLayout><ResourcesPage /></AppLayout>} />
            <Route path="/8328246413/audit-logs" element={<AppLayout><AuditLogsPage /></AppLayout>} />

            {/* Fallback */}
            <Route path="/" element={<DefaultRedirect />} />
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};
