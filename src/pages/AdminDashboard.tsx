import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
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

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, empRes, deptRes] = await Promise.all([
        api.get('/reports/admin-overview'),
        api.get('/employees'),
        api.get('/employees/departments'),
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
        setTargetRevenue(String(overviewRes.data.data.summary.targetRevenue));
        setTargetLeads(String(overviewRes.data.data.summary.targetLeads));
      }
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  const revenueChartData = [
    {
      name: 'Current Month Target',
      Target: overview?.summary.targetRevenue || 1000000,
      Achieved: overview?.summary.revenue || 0,
    },
  ];

  const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#9333EA'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Operations & Analytics Overview</h1>
          <p className="text-xs text-slate-500">Real-time database insights, staff directory, lead importer, and targets</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAdminData} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh Real Data
          </Button>
          <Link to="/leads/import">
            <Button variant="outline" icon={<PhoneCall className="w-4 h-4 text-blue-600" />}>
              Lead File Importer
            </Button>
          </Link>
          <Button onClick={() => setIsCreateOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
            Create Employee
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

      {/* EMPLOYEE DIRECTORY & ACCESS TABLE */}
      <Card title="Employee Directory & Access Control">
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
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{emp.employeeId}</td>
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
              ))}
            </tbody>
          </table>
        </div>
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
  );
};
