import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckSquare,
  Building2,
  Mail,
  Phone,
  Lock,
  PlusCircle,
  X,
  Eye,
} from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface CoInternUser {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone?: string;
  designation: string;
  department?: { id: string; name: string };
  joiningDate: string;
  isActive: boolean;
  taskStats?: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export const CoInternsPage: React.FC = () => {
  const [coInterns, setCoInterns] = useState<CoInternUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [nextId, setNextId] = useState<string>('CO-IN00426');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Co-Intern');
  const [departmentId, setDepartmentId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('CoIntern#2026');
  const [joiningDate, setJoiningDate] = useState('2026-10-05');
  const [submitting, setSubmitting] = useState(false);

  // Allot Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedCoIntern, setSelectedCoIntern] = useState<CoInternUser | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Bulk Selection & Give Task State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTaskModalOpen, setBulkTaskModalOpen] = useState(false);

  // Status Message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCoInterns = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/employees/departments'),
      ]);

      if (empRes.data.success) {
        const allEmps: CoInternUser[] = empRes.data.data || [];
        const filtered = allEmps.filter(
          (emp) =>
            emp.employeeId.toUpperCase().startsWith('CO-IN') ||
            emp.designation.toLowerCase().includes('co-intern') ||
            emp.designation.toLowerCase().includes('intern')
        );
        setCoInterns(filtered);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load co-interns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoInterns();
  }, []);

  const handleOpenCreateModal = async () => {
    try {
      const res = await api.get('/employees/next-co-intern-id');
      if (res.data.success && res.data.data.nextId) {
        setNextId(res.data.data.nextId);
      }
    } catch {
      setNextId('CO-IN00426');
    }
    setCreateModalOpen(true);
  };

  const handleCreateCoIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        name,
        email,
        phone,
        designation,
        departmentId: departmentId || undefined,
        temporaryPassword,
        joiningDate: joiningDate || '2026-10-05',
      };

      const res = await api.post('/employees/co-intern', payload);
      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          text: `Co-Intern ${res.data.data.name} (${res.data.data.employeeId}) created successfully as employee profile!`,
        });
        setCreateModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setDesignation('Co-Intern');
        setDepartmentId('');
        fetchCoInterns();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create Co-Intern profile.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTaskModal = (intern: CoInternUser) => {
    setSelectedCoIntern(intern);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setTaskModalOpen(true);
  };

  const handleAllotTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoIntern) return;
    setTaskSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        assignedToId: selectedCoIntern.id,
        dueDate: taskDueDate || undefined,
      };

      const res = await api.post('/tasks', payload);
      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          text: `Task "${taskTitle}" allotted to ${selectedCoIntern.name} (${selectedCoIntern.employeeId})!`,
        });
        setTaskModalOpen(false);
        fetchCoInterns();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to allot task.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setTaskSubmitting(false);
    }
  };

  const filteredCoInterns = coInterns.filter(
    (intern) =>
      intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredCoInterns.length > 0 &&
    filteredCoInterns.every((intern) => selectedIds.includes(intern.id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const filteredSet = new Set(filteredCoInterns.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const filteredIds = filteredCoInterns.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleOpenGiveTaskModal = () => {
    if (selectedIds.length === 0 && filteredCoInterns.length > 0) {
      setSelectedIds(filteredCoInterns.map((i) => i.id));
    }
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setBulkTaskModalOpen(true);
  };

  const handleBulkAllotTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setTaskSubmitting(true);
    setStatusMessage(null);

    try {
      let successCount = 0;
      let failCount = 0;

      for (const internId of selectedIds) {
        try {
          const payload = {
            title: taskTitle,
            description: taskDescription,
            priority: taskPriority,
            assignedToId: internId,
            dueDate: taskDueDate || undefined,
          };
          const res = await api.post('/tasks', payload);
          if (res.data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        setStatusMessage({
          type: 'success',
          text: `Task "${taskTitle}" successfully allotted to ${successCount} co-intern(s)${
            failCount > 0 ? ` (${failCount} failed)` : ''
          }!`,
        });
        setBulkTaskModalOpen(false);
        setSelectedIds([]);
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('MEDIUM');
        setTaskDueDate('');
        fetchCoInterns();
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to allot task to selected co-interns.',
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to allot tasks.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" /> Co-Intern Management System
          </div>
          <h1 className="text-2xl font-bold">Co-Intern Profiles & Task Allotment</h1>
          <p className="text-emerald-100 text-sm mt-0.5">
            Create Co-Intern profiles with auto-generated IDs (starting from CO-IN00426) and allot work directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            onClick={handleOpenGiveTaskModal}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold border-0 shadow-sm"
          >
            <CheckSquare className="w-4 h-4 mr-2" /> Give Task {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </Button>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Co-Intern Profile
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID (e.g. CO-IN00426), email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {filteredCoInterns.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-colors shrink-0 border border-slate-200">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Select All ({filteredCoInterns.length})</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            {selectedIds.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                {selectedIds.length} Selected
              </span>
            )}
            <span>
              Total Co-Intern Profiles: <span className="font-bold text-slate-900">{coInterns.length}</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Co-Intern Profiles Grid */}
      {filteredCoInterns.length === 0 ? (
        <Card className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Co-Intern Profiles Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Create Co-Intern Profile" above to create your first co-intern starting from CO-IN00426.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoInterns.map((intern) => {
            const isSelected = selectedIds.includes(intern.id);
            return (
              <Card
                key={intern.id}
                className={`hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 ${
                  isSelected ? 'border-2 border-emerald-500 bg-emerald-50/20' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(intern.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                        {intern.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{intern.name}</h3>
                        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {intern.employeeId}
                        </span>
                      </div>
                    </div>
                    <Badge variant={intern.isActive ? 'success' : 'neutral'}>
                      {intern.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {intern.designation} • {intern.department?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{intern.email}</span>
                    </div>
                    {intern.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{intern.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Joined: {new Date(intern.joiningDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    Tasks: <span className="font-bold text-slate-800">{intern.taskStats?.completed || 0}</span> /{' '}
                    {intern.taskStats?.total || 0} Done
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenTaskModal(intern)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Allot Task
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Give Task (Bulk Allot) Modal */}
      <Modal
        isOpen={bulkTaskModalOpen}
        onClose={() => setBulkTaskModalOpen(false)}
        title={`Give Task to Co-Interns (${selectedIds.length} Selected)`}
      >
        <form onSubmit={handleBulkAllotTask} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span>Allotting task to {selectedIds.length} Co-Intern(s):</span>
              <button
                type="button"
                onClick={handleSelectAllToggle}
                className="text-xs text-amber-700 hover:underline font-bold"
              >
                {isAllSelected ? 'Deselect All' : `Select All (${coInterns.length})`}
              </button>
            </div>
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                {coInterns
                  .filter((i) => selectedIds.includes(i.id))
                  .map((i) => (
                    <span
                      key={i.id}
                      className="inline-flex items-center gap-1 bg-white text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded border border-amber-300 shadow-sm"
                    >
                      <span className="font-sans font-medium">{i.name}</span>
                      <span className="text-emerald-700">({i.employeeId})</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(i.id)}
                        className="hover:text-red-600 font-bold ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Build React Component or Weekly Sprint Task"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide clear task instructions for selected co-interns..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setBulkTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={taskSubmitting || selectedIds.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {taskSubmitting
                ? 'Allotting Tasks...'
                : `Give Task to ${selectedIds.length} Co-Intern${selectedIds.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Co-Intern Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Co-Intern Profile">
        <form onSubmit={handleCreateCoIntern} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <span className="font-medium">Auto-Generated Co-Intern ID:</span>
            <span className="font-mono font-bold text-sm bg-white px-2.5 py-1 rounded border border-emerald-300">
              {nextId}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="rahul@blunet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- General --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Temporary Login Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? 'Creating Co-Intern...' : 'Create Co-Intern & Create Employee Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Single Allot Task Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title={`Allot Task to ${selectedCoIntern?.name}`}>
        <form onSubmit={handleAllotTask} className="space-y-4">
          <div className="text-xs text-slate-500">
            Assigning new task for Co-Intern profile: <span className="font-mono font-bold text-slate-900">{selectedCoIntern?.employeeId}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Build React Component or Code Review"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide clear task instructions..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={taskSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {taskSubmitting ? 'Allotting Task...' : 'Allot Task to Co-Intern'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
