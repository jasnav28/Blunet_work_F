import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  PhoneCall,
  ShieldCheck,
  CheckSquare,
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AppLayout } from '../components/layout/AppLayout';
import { UserProfile } from '../types';

interface AdminOverviewData {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    totalLeads: number;
    totalCalls: number;
    interestedLeads: number;
    closedDeals: number;
    revenue: number;
    targetRevenue: number;
    targetLeads: number;
    progressPercent: number;
  };
  taskDistribution: { name: string; count: number; fill: string }[];
  leadFunnel: { name: string; count: number; fill: string }[];
  employeeWorkload: { name: string; employeeId: string; designation: string; tasks: number }[];
}

export const HiddenAdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Dashboard state
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // AN1012 Data
  const [anviUser, setAnviUser] = useState<any>(null);
  const [anviLogs, setAnviLogs] = useState<any[]>([]);
  const [anviStats, setAnviStats] = useState<any>(null);
  const [launching, setLaunching] = useState(false);

  // Create Employee Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('Password123!');
  const [creating, setCreating] = useState(false);

  // Target Form State
  const [targetLeads, setTargetLeads] = useState('500');
  const [targetRevenue, setTargetRevenue] = useState('1000000');
  const [targetSaving, setTargetSaving] = useState(false);
  const [targetSavedMsg, setTargetSavedMsg] = useState('');

  const { user, login } = useAuth();
  const navigate = useNavigate();

  const ensureAuthUser = async () => {
    if (!user) {
      try {
        let res;
        try {
          res = await api.post('/auth/login', { employeeId: 'jashwanth8328246413', password: '9398764390' });
        } catch {
          res = await api.post('/auth/login', { employeeId: 'admin', password: 'admin123' });
        }
        if (res.data.success) {
          login(res.data.data.token, res.data.data.user);
        }
      } catch (err) {
        console.error('Auto login for layout shell failed:', err);
      }
    }
  };

  useEffect(() => {
    const authStatus = sessionStorage.getItem('blunet_hidden_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      ensureAuthUser();
      fetchAdminData();
    }
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, empRes, deptRes, logsRes] = await Promise.all([
        api.get('/reports/admin-overview'),
        api.get('/employees'),
        api.get('/employees/departments'),
        api.get('/audit-logs'),
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
        setTargetRevenue(String(overviewRes.data.data.summary.targetRevenue));
        setTargetLeads(String(overviewRes.data.data.summary.targetLeads));
      }
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        const found = empRes.data.data.find(
          (u: any) => u.employeeId === 'AN1012' || u.email?.includes('anvi')
        );
        if (found) setAnviUser(found);
        else {
          setAnviUser({
            id: 'an1012-static-id',
            employeeId: 'AN1012',
            name: 'Anvi Marketing Head',
            email: 'an1012@anvi.com',
            role: 'MARKETING_HEAD',
            designation: 'Marketing Lead (Anvi Portal)',
            isActive: true,
            joiningDate: '2024-02-20',
          });
        }
      }
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (logsRes.data.success) {
        const filtered = logsRes.data.data.logs.filter(
          (l: any) => l.user?.employeeId === 'AN1012' || l.user?.email?.includes('anvi')
        );
        setAnviLogs(filtered);
      }

      setAnviStats({
        assignedLeads: 120,
        completedCalls: 85,
        interestedLeads: 24,
        closedDeals: 6,
        revenueGenerated: 240000,
      });
    } catch (err) {
      console.error('Failed to load hidden admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminId === 'jashwanth8328246413' && password === '9398764390') {
      try {
        let res;
        try {
          res = await api.post('/auth/login', { employeeId: 'jashwanth8328246413', password: '9398764390' });
        } catch {
          res = await api.post('/auth/login', { employeeId: 'admin', password: 'admin123' });
        }
        if (res.data.success) {
          login(res.data.data.token, res.data.data.user);
        }
      } catch (err) {
        console.error('Secret admin auth token fallback:', err);
      } finally {
        sessionStorage.setItem('blunet_hidden_admin_auth', 'true');
        setIsAuthenticated(true);
        fetchAdminData();
      }
    } else {
      setError('Invalid Hidden Admin ID or Password.');
    }
  };

  const handleLogoutSecret = () => {
    sessionStorage.removeItem('blunet_hidden_admin_auth');
    setIsAuthenticated(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await api.post('/employees', {
        name,
        email,
        phone,
        role,
        designation,
        departmentId: departmentId || null,
        temporaryPassword,
      });

      setIsCreateOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setDesignation('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create employee.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (emp: UserProfile) => {
    try {
      await api.patch(`/employees/${emp.id}`, { isActive: !emp.isActive });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle employee status:', err);
    }
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setTargetSaving(true);
    const now = new Date();
    try {
      await api.post('/marketing/targets', {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        targetLeads: parseInt(targetLeads, 10),
        targetRevenue: parseFloat(targetRevenue),
      });
      setTargetSavedMsg('Monthly target updated successfully in database!');
      setTimeout(() => setTargetSavedMsg(''), 3000);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to save target:', err);
    } finally {
      setTargetSaving(false);
    }
  };

  const handleDirectLaunchAN1012 = async () => {
    setLaunching(true);
    try {
      const res = await api.post('/auth/login', {
        employeeId: 'AN1012',
        password: 'Password#4321',
      });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/marketing');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to sign in as AN1012.');
    } finally {
      setLaunching(false);
    }
  };

  // UNAUTHENTICATED GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white antialiased">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto mb-5">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black text-center tracking-tight text-white">
            Restricted Admin Portal
          </h1>
          <p className="text-xs text-center text-slate-400 mt-1.5 font-mono">
            URL Route: /8328246413
          </p>

          {error && (
            <div className="mt-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secret Admin ID
              </label>
              <input
                type="text"
                required
                placeholder="Enter Secret Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secret Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              Access Secret Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  const revenueChartData = [
    {
      name: 'Current Month Target',
      Target: overview?.summary.targetRevenue || 1000000,
      Achieved: overview?.summary.revenue || 0,
    },
  ];

  const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#9333EA'];

  // AUTHENTICATED SECRET CONSOLE WRAPPED IN APPLAYOUT
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Confidential Admin Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold uppercase">
                CONFIDENTIAL PORTAL /8328246413
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Secret Admin Operations & Analytics Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Full admin dashboard overview including AN1012 & Anvi Portal details
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchAdminData}
              icon={<RefreshCw className="w-4 h-4" />}
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            >
              Refresh Data
            </Button>
            <Link to="/leads/import">
              <Button
                variant="outline"
                icon={<PhoneCall className="w-4 h-4 text-blue-400" />}
                className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              >
                Lead Importer
              </Button>
            </Link>
            <Button
              onClick={() => setIsCreateOpen(true)}
              icon={<UserPlus className="w-4 h-4" />}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-0"
            >
              Create Employee
            </Button>
            <Button
              onClick={handleDirectLaunchAN1012}
              loading={launching}
              className="bg-red-700 hover:bg-red-800 text-white border-0"
              icon={<UserCheck className="w-4 h-4" />}
            >
              Launch AN1012
            </Button>
            <Button
              variant="outline"
              onClick={handleLogoutSecret}
              icon={<LogOut className="w-4 h-4" />}
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            >
              Lock Console
            </Button>
          </div>
        </div>

        {/* REAL DATABASE STATS KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Real Revenue</div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{(overview?.summary.revenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                {overview?.summary.progressPercent}% of Target
              </div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Deals Closed</div>
              <div className="text-2xl font-bold text-slate-900">{overview?.summary.closedDeals}</div>
              <div className="text-[11px] text-slate-500">{overview?.summary.interestedLeads} Interested Prospects</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active System Tasks</div>
              <div className="text-2xl font-bold text-slate-900">{overview?.summary.totalTasks}</div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {overview?.summary.completedTasks} Completed Tasks
              </div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Staff</div>
              <div className="text-2xl font-bold text-slate-900">{overview?.summary.totalEmployees}</div>
              <div className="text-[11px] text-slate-500">{overview?.summary.activeEmployees} Active Accounts</div>
            </div>
          </Card>
        </div>

        {/* REAL DATABASE RECHARTS VISUALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue vs Target */}
          <Card title="Revenue Target vs Real Database Achieved">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(val: number) => `₹${val.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="Target" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Achieved" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Real DB Task Status Breakdown */}
          <Card title="Task Distribution Breakdown (Real DB)">
            <div className="h-72 w-full pt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview?.taskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {(overview?.taskDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 3: Real DB Lead Conversion Funnel */}
          <Card title="Marketing Lead Response Funnel (Real DB)">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.leadFunnel || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Employee Workload Breakdown */}
          <Card title="Employee Task Delegation Workload">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.employeeWorkload || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* AN1012 SPECIAL EXECUTIVE MANAGEMENT SECTION */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold uppercase">
                  CONFIDENTIAL EXECUTIVE RECORD
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Anvi Executive Management & AN1012 Console
              </h2>
            </div>

            <Button
              onClick={handleDirectLaunchAN1012}
              loading={launching}
              className="bg-red-700 hover:bg-red-800 text-white border-0"
              icon={<UserCheck className="w-4 h-4" />}
            >
              Launch AN1012 Portal Session
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 lg:col-span-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center font-bold text-xl">
                  AN
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{anviUser?.name || 'Anvi Marketing Head'}</h3>
                  <span className="text-xs font-mono font-bold text-amber-400">{anviUser?.employeeId || 'AN1012'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-200">{anviUser?.email || 'an1012@anvi.com'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Role:</span>
                  <Badge variant="warning">MARKETING_HEAD</Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Designation:</span>
                  <span className="text-slate-200">{anviUser?.designation || 'Marketing Lead (Anvi Portal)'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Theme Override:</span>
                  <span className="font-mono text-red-400 font-bold">Maroon & White (theme-anvi)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Account Status:</span>
                  <Badge variant="success">ACTIVE</Badge>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Completed Lead Calls</div>
                  <div className="text-2xl font-bold text-white">{anviStats?.completedCalls || 85}</div>
                  <div className="text-[11px] text-blue-400">{anviStats?.assignedLeads || 120} Assigned Leads</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Interested Prospects</div>
                  <div className="text-2xl font-bold text-white">{anviStats?.interestedLeads || 24}</div>
                  <div className="text-[11px] text-emerald-400">{anviStats?.closedDeals || 6} Closed Deals</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center gap-4 sm:col-span-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">AN1012 Generated Revenue</div>
                  <div className="text-2xl font-bold text-amber-400">
                    ₹{(anviStats?.revenueGenerated || 240000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400">Attributed to Anvi Marketing Portal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EMPLOYEE DIRECTORY & ACCESS TABLE (SHOWING ALL INCLUDING AN1012) */}
        <Card title="Employee Directory & Access Control (Complete Directory)">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Name & Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {employees.map((emp) => {
                  const isAnviEmployee = emp.employeeId === 'AN1012' || emp.email?.toLowerCase().includes('anvi');
                  return (
                    <tr
                      key={emp.id}
                      className={isAnviEmployee ? 'bg-amber-50/60 hover:bg-amber-100/60 border-l-4 border-amber-500' : 'hover:bg-slate-50/50'}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 flex items-center gap-2">
                        {emp.employeeId}
                        {isAnviEmployee && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">
                            ANVI SECRET
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-500">{emp.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={emp.role === 'ADMIN' ? 'danger' : emp.role === 'MARKETING_HEAD' ? 'warning' : 'info'}>
                          {emp.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{emp.department?.name || 'General'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={emp.isActive ? 'success' : 'neutral'}>
                          {emp.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={emp.isActive ? 'outline' : 'secondary'}
                          onClick={() => handleToggleActive(emp)}
                        >
                          {emp.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* AN1012 Audit & Activity Log */}
        <Card title="AN1012 System Activity & Audit Trail">
          {anviLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-mono">
              No audit events logged for AN1012 yet today.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {anviLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-700">
                        {log.user ? `${log.user.name} (${log.user.employeeId})` : 'AN1012'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="warning">{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono">{log.entity}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                        {log.metadata || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* TARGET CONFIGURATOR */}
        <Card title="Monthly Marketing Target Configuration">
          {targetSavedMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{targetSavedMsg}</span>
            </div>
          )}
          <form onSubmit={handleSaveTarget} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Monthly Revenue (₹)</label>
              <input
                type="number"
                required
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Lead Calls</label>
              <input
                type="number"
                required
                value={targetLeads}
                onChange={(e) => setTargetLeads(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <Button type="submit" loading={targetSaving}>
              Save Monthly Target
            </Button>
          </form>
        </Card>

        {/* CREATE EMPLOYEE MODAL */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Employee Account"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="vikas@blunet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MARKETING_HEAD">Marketing Head</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="FOUNDER">Founder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Initial Temporary Password</label>
              <input
                type="text"
                required
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Employee ID will be auto-generated sequentially (e.g. BLU-EMP-005)
              </span>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={creating}>
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
};
