import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldCheck, Search, AlertCircle, CheckCircle2, UserCheck, Clock, UserX } from 'lucide-react';
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

  const fetchEmployeesData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
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

  const filteredEmployees = employees.filter((emp) => {
    if (emp.employeeId === 'AN1012' || emp.email?.toLowerCase().includes('anvi')) return false;
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
          <h1 className="text-xl font-bold text-slate-900">Employee Staff Directory & Progress</h1>
          <p className="text-xs text-slate-500">Manage employee accounts, assign roles, monitor task completion rates, and manage access</p>
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
                <th className="px-4 py-3">Task Completion Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{emp.name}</div>
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
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
