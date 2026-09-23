import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Clock,
  UserX,
  Eye,
  CheckSquare,
  Terminal,
  Calendar,
  Activity,
  Code2,
} from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserProfile } from '../types';

interface ExtendedUserProfile extends UserProfile {
  taskStats?: {
    total: number;
    completed: number;
    inProgress: number;
    progressRate: number;
  };
}

interface ActivitySessionItem {
  id: string;
  loginAt: string;
  logoutAt?: string | null;
  activeSeconds: number;
  idleSeconds: number;
  lastHeartbeatAt: string;
}

interface WorkTaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  dueDate?: string | null;
  createdAt: string;
  assignedBy?: { name: string; employeeId: string };
}

interface CodingSubmissionItem {
  id: string;
  month: number;
  taskId: string;
  code: string;
  status: string;
  submittedAt: string;
}

interface FullEmployeeDetail extends UserProfile {
  department?: { id: string; name: string; code: string } | null;
  assignedTasks: WorkTaskItem[];
  activitySessions: ActivitySessionItem[];
  studyLessonsCompletedCount: number;
  codingTasksCompletedCount: number;
  totalMonthlyCodingTasks: number;
  codingSubmissions: CodingSubmissionItem[];
}

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<ExtendedUserProfile[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('Password123!');
  const [creating, setCreating] = useState(false);

  // Delete Modal State
  const [selectedForDelete, setSelectedForDelete] = useState<ExtendedUserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Employee Performance & Detail Modal State
  const [detailModalEmployee, setDetailModalEmployee] = useState<FullEmployeeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState<'SCREENTIME' | 'WORK_TASKS' | 'STUDY_TASKS'>('SCREENTIME');
  const [inspectingCode, setInspectingCode] = useState<CodingSubmissionItem | null>(null);

  const isAnvi = window.location.pathname.startsWith('/8328246413');
  const targetOrg = isAnvi ? 'ANVI' : 'BLUNET';

  const fetchEmployeesData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get(`/employees?org=${targetOrg}`),
        api.get('/employees/departments'),
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const openEmployeeDetail = async (empId: string) => {
    setLoadingDetail(true);
    setDetailActiveTab('SCREENTIME');
    setInspectingCode(null);
    try {
      const res = await api.get(`/employees/${empId}`);
      if (res.data.success) {
        setDetailModalEmployee(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load employee details:', err);
    } finally {
      setLoadingDetail(false);
    }
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
        organization: targetOrg,
      });

      setIsCreateOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setDesignation('');
      fetchEmployeesData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create employee account.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (emp: ExtendedUserProfile) => {
    try {
      await api.patch(`/employees/${emp.id}`, { isActive: !emp.isActive });
      fetchEmployeesData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedForDelete) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/employees/${selectedForDelete.id}`);
      if (res.data.success) {
        setSelectedForDelete(null);
        fetchEmployeesData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete employee.');
    } finally {
      setDeleting(false);
    }
  };

  const formatSecondsToDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} mins`;
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Employee Staff Directory & Performance</h1>
          <p className="text-xs text-slate-500">
            Click any employee row to inspect daily login screen time, regular work tasks, and study coding tasks.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Add New Employee
        </Button>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, Employee ID (BLU-EMP-XXX), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'EMPLOYEE', 'MARKETING_HEAD', 'ADMIN', 'FOUNDER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* EMPLOYEE PERFORMANCE & DIRECTORY TABLE */}
      <Card title={`Staff Members (${filteredEmployees.length} Total)`}>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Name & Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Work Task Completion</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => openEmployeeDetail(emp.id)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5 hover:text-blue-600">
                      <span>{emp.name}</span>
                      <Eye className="w-3.5 h-3.5 text-blue-500 opacity-80" />
                    </div>
                    <div className="text-[11px] text-slate-500">{emp.email} • {emp.designation}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={emp.role === 'ADMIN' ? 'danger' : emp.role === 'MARKETING_HEAD' ? 'warning' : 'info'}>
                      {emp.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{emp.department?.name || 'General'}</td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">
                        {emp.taskStats?.completed || 0}/{emp.taskStats?.total || 0} Tasks
                      </span>
                      <span className="font-bold text-blue-600">{emp.taskStats?.progressRate || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${emp.taskStats?.progressRate || 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={emp.isActive ? 'success' : 'neutral'}>
                      {emp.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEmployeeDetail(emp.id)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                      <Button
                        size="sm"
                        variant={emp.isActive ? 'outline' : 'secondary'}
                        onClick={() => handleToggleActive(emp)}
                      >
                        {emp.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setSelectedForDelete(emp)}
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EMPLOYEE PERFORMANCE & SCREEN TIME DETAIL MODAL */}
      {detailModalEmployee && (
        <Modal
          isOpen={!!detailModalEmployee}
          onClose={() => setDetailModalEmployee(null)}
          title={`Employee Performance Profile: ${detailModalEmployee.name}`}
          maxWidth="xl"
        >
          {loadingDetail ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Employee Summary Card */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 font-mono text-xs">{detailModalEmployee.employeeId}</span>
                    <Badge variant={detailModalEmployee.role === 'ADMIN' ? 'danger' : 'info'}>
                      {detailModalEmployee.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold mt-1">{detailModalEmployee.name}</h2>
                  <p className="text-slate-300 text-xs mt-0.5">
                    {detailModalEmployee.designation} • {detailModalEmployee.department?.name || 'General Department'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1">{detailModalEmployee.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white/10 p-3 rounded-xl border border-white/15 shrink-0">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">1. Regular Work Tasks</span>
                    <div className="font-bold text-base text-white">
                      {(detailModalEmployee.assignedTasks || []).filter((t) => t.status === 'COMPLETED').length} / {(detailModalEmployee.assignedTasks || []).length} Done
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">2. Study Coding Tasks</span>
                    <div className="font-bold text-base text-blue-300">
                      {detailModalEmployee.codingTasksCompletedCount || 0} / 40 Done
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Tab Navigation inside Modal */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setDetailActiveTab('SCREENTIME')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    detailActiveTab === 'SCREENTIME'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Everyday Login & Screen Time
                </button>

                <button
                  onClick={() => setDetailActiveTab('WORK_TASKS')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    detailActiveTab === 'WORK_TASKS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  1. Regular Work Tasks ({(detailModalEmployee.assignedTasks || []).length})
                </button>

                <button
                  onClick={() => setDetailActiveTab('STUDY_TASKS')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    detailActiveTab === 'STUDY_TASKS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  2. Study Coding Tasks ({detailModalEmployee.codingTasksCompletedCount || 0}/40)
                </button>
              </div>

              {/* TAB 1: EVERYDAY LOGIN & SCREEN TIME */}
              {detailActiveTab === 'SCREENTIME' && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-700">
                    Recent Daily Session History (Login Time to Logout Time & Active Screentime)
                  </div>

                  {(detailModalEmployee.activitySessions || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                      No activity session logs recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Login Date & Time</th>
                            <th className="p-3">Logout Time</th>
                            <th className="p-3">Active Screentime</th>
                            <th className="p-3">Idle Duration</th>
                            <th className="p-3">Last Heartbeat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(detailModalEmployee.activitySessions || []).map((session) => (
                            <tr key={session.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-medium text-slate-900">
                                {new Date(session.loginAt).toLocaleString()}
                              </td>
                              <td className="p-3 font-mono text-slate-600">
                                {session.logoutAt ? new Date(session.logoutAt).toLocaleTimeString() : 'Session Active / In Progress'}
                              </td>
                              <td className="p-3 font-bold text-blue-600 font-mono">
                                {formatSecondsToDuration(session.activeSeconds)}
                              </td>
                              <td className="p-3 text-slate-500 font-mono">
                                {formatSecondsToDuration(session.idleSeconds)}
                              </td>
                              <td className="p-3 text-[11px] text-slate-400">
                                {new Date(session.lastHeartbeatAt).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REGULAR WORK TASKS */}
              {detailActiveTab === 'WORK_TASKS' && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-700">
                    Assigned Regular Work Tasks ({(detailModalEmployee.assignedTasks || []).length} Total)
                  </div>

                  {(detailModalEmployee.assignedTasks || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                      No regular work tasks assigned to this employee.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {(detailModalEmployee.assignedTasks || []).map((t) => (
                        <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={t.priority === 'URGENT' || t.priority === 'HIGH' ? 'danger' : 'warning'}>
                                {t.priority}
                              </Badge>
                              <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'primary' : 'neutral'}>
                                {t.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-slate-900">{t.title}</h4>
                            <p className="text-slate-500 text-[11px] line-clamp-1">{t.description}</p>
                          </div>

                          <div className="text-[11px] text-slate-500 shrink-0 font-mono">
                            {t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : 'No due date'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STUDY CODING TASKS */}
              {detailActiveTab === 'STUDY_TASKS' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-blue-900">Month 1 Study Coding Tasks Completion:</span>
                      <span className="ml-2 font-mono font-bold text-blue-700">
                        {detailModalEmployee.codingTasksCompletedCount || 0} / 40 Tasks Completed
                      </span>
                    </div>
                    <Badge variant={(detailModalEmployee.codingTasksCompletedCount || 0) >= 40 ? 'success' : 'primary'}>
                      {Math.round(((detailModalEmployee.codingTasksCompletedCount || 0) / 40) * 100)}% Completed
                    </Badge>
                  </div>

                  {(detailModalEmployee.codingSubmissions || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                      No study coding tasks submitted yet by this employee.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {(detailModalEmployee.codingSubmissions || []).map((sub) => (
                        <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 font-mono">
                              Task #{sub.taskId} (Month {sub.month})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Submitted: {new Date(sub.submittedAt).toLocaleString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setInspectingCode(inspectingCode?.id === sub.id ? null : sub)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                          >
                            {inspectingCode?.id === sub.id ? 'Hide Submitted Code' : 'Inspect Submitted Code'}
                          </button>

                          {inspectingCode?.id === sub.id && (
                            <pre className="p-3 bg-slate-900 text-blue-300 font-mono text-[11px] rounded-lg overflow-x-auto">
                              <code>{sub.code}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Employee Account"
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Initial Password</label>
            <input
              type="text"
              required
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      {selectedForDelete && (
        <Modal
          isOpen={!!selectedForDelete}
          onClose={() => setSelectedForDelete(null)}
          title="Confirm Employee Deletion"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>
                Are you sure you want to permanently delete <strong>{selectedForDelete.name}</strong> ({selectedForDelete.employeeId})? This action cannot be undone.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedForDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteEmployee} loading={deleting}>
                Permanently Delete Employee
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
