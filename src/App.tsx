import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { getUserSlug } from './lib/userSlug';

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
import { StudyResourcesPage } from './pages/StudyResourcesPage';

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
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hiddenAdminAuth = typeof window !== 'undefined' && sessionStorage.getItem('blunet_hidden_admin_auth') === 'true';
  const isAnviRoute = location.pathname.startsWith('/8328246413');

  if (!user && !hiddenAdminAuth && !isAnviRoute) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role) && !isAnviRoute) {
    const userSlug = getUserSlug(user);
    if (user.role === 'ADMIN') return <Navigate to={`/${userSlug}/admin`} replace />;
    if (user.role === 'MARKETING_HEAD') return <Navigate to={`/${userSlug}/marketing`} replace />;
    if (user.role === 'FOUNDER') return <Navigate to={`/${userSlug}/founder`} replace />;
    return <Navigate to={`/${userSlug}/dashboard`} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  const hiddenAdminAuth = typeof window !== 'undefined' && sessionStorage.getItem('blunet_hidden_admin_auth') === 'true';
  if (hiddenAdminAuth) return <Navigate to="/8328246413/admin" replace />;
  if (!user) return <Navigate to="/login" replace />;

  const userSlug = getUserSlug(user);
  if (user.role === 'ADMIN') return <Navigate to={`/${userSlug}/admin`} replace />;
  if (user.role === 'MARKETING_HEAD') return <Navigate to={`/${userSlug}/marketing`} replace />;
  if (user.role === 'FOUNDER') return <Navigate to={`/${userSlug}/founder`} replace />;
  return <Navigate to={`/${userSlug}/dashboard`} replace />;
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
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/:userSlug/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><EmployeeDashboard /></ProtectedRoute>} />

            {/* Tasks */}
            <Route path="/tasks" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><TasksPage /></ProtectedRoute>} />
            <Route path="/:userSlug/tasks" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><TasksPage /></ProtectedRoute>} />

            {/* Resources */}
            <Route path="/resources" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><ResourcesPage /></ProtectedRoute>} />
            <Route path="/:userSlug/resources" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><ResourcesPage /></ProtectedRoute>} />

            {/* Study Resources */}
            <Route path="/study-resources" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><StudyResourcesPage /></ProtectedRoute>} />
            <Route path="/:userSlug/study-resources" element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><StudyResourcesPage /></ProtectedRoute>} />

            {/* Marketing Head Overview & Caller */}
            <Route path="/marketing" element={<ProtectedRoute allowedRoles={['MARKETING_HEAD', 'ADMIN', 'FOUNDER']}><MarketingDashboard /></ProtectedRoute>} />
            <Route path="/:userSlug/marketing" element={<ProtectedRoute allowedRoles={['MARKETING_HEAD', 'ADMIN', 'FOUNDER']}><MarketingDashboard /></ProtectedRoute>} />
            
            <Route path="/leads" element={<ProtectedRoute allowedRoles={['MARKETING_HEAD', 'ADMIN']}><MarketingDashboard /></ProtectedRoute>} />
            <Route path="/:userSlug/leads" element={<ProtectedRoute allowedRoles={['MARKETING_HEAD', 'ADMIN']}><MarketingDashboard /></ProtectedRoute>} />

            {/* Admin Dedicated Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/:userSlug/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

            {/* Dedicated Employees Management Page */}
            <Route path="/employees" element={<ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><EmployeesPage /></ProtectedRoute>} />
            <Route path="/:userSlug/employees" element={<ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD', 'FOUNDER']}><EmployeesPage /></ProtectedRoute>} />

            {/* Dedicated Marketing Team & Lead Importer Page */}
            <Route path="/marketing-team" element={<ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD']}><MarketingTeamPage /></ProtectedRoute>} />
            <Route path="/:userSlug/marketing-team" element={<ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD']}><MarketingTeamPage /></ProtectedRoute>} />

            <Route path="/leads/import" element={<ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD']}><LeadImporterPage /></ProtectedRoute>} />
            <Route path="/:userSlug/leads/import" element={<ProtectedRoute allowedRoles={['ADMIN', 'MARKETING_HEAD']}><LeadImporterPage /></ProtectedRoute>} />

            <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/:userSlug/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogsPage /></ProtectedRoute>} />

            {/* Founder Routes */}
            <Route path="/founder" element={<ProtectedRoute allowedRoles={['FOUNDER', 'ADMIN']}><FounderDashboard /></ProtectedRoute>} />
            <Route path="/:userSlug/founder" element={<ProtectedRoute allowedRoles={['FOUNDER', 'ADMIN']}><FounderDashboard /></ProtectedRoute>} />

            {/* Hidden Secret Admin Anvi Routes */}
            <Route path="/8328246413" element={<HiddenAdminPage />} />
            <Route path="/8328246413/admin" element={<HiddenAdminPage />} />
            <Route path="/8328246413/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
            <Route path="/8328246413/marketing-team" element={<ProtectedRoute><MarketingTeamPage /></ProtectedRoute>} />
            <Route path="/8328246413/leads/import" element={<ProtectedRoute><LeadImporterPage /></ProtectedRoute>} />
            <Route path="/8328246413/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/8328246413/study-resources" element={<ProtectedRoute><StudyResourcesPage /></ProtectedRoute>} />
            <Route path="/8328246413/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
            <Route path="/8328246413/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="/" element={<DefaultRedirect />} />
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};
