import React, { useState, useEffect } from 'react';
import {
  Plus,
  CheckSquare,
  MessageSquare,
  Clock,
  UserCheck,
  Calendar,
  Trash2,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Task, UserProfile } from '../types';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State for Task Assignment (Admin)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Modal State for Submitting Work (Employee & Co-Interns)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitTaskId, setSubmitTaskId] = useState('');
  const [submissionDetails, setSubmissionDetails] = useState('');
  const [submissionLinks, setSubmissionLinks] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Task Details Modal State (Click to view full description)
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  // Comment Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');

  // Status Message Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTasks = async () => {
    try {
      const endpoint = user?.role === 'EMPLOYEE' ? '/tasks/my' : '/tasks';
      const res = await api.get(endpoint);
      if (res.data.success) setTasks(res.data.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (user?.role === 'ADMIN' || user?.role === 'MARKETING_HEAD' || user?.role === 'FOUNDER') {
      try {
        const res = await api.get('/employees');
        if (res.data.success) setEmployees(res.data.data);
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [user]);

  const extractErrorMessage = (err: any, fallback: string): string => {
    const serverMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Connection timed out. Please check your internet connection and try again.';
    }
    if (!err.response) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (err.response?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (err.response?.status === 403) {
      return serverMsg || 'You do not have permission to perform this task action.';
    }
    if (err.response?.status === 404) {
      return serverMsg || 'The requested task was not found.';
    }
    return serverMsg || fallback;
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setStatusMessage(null);
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setStatusMessage({
        type: 'success',
        text: `Task status updated to ${newStatus.replace('_', ' ')} successfully!`,
      });
      fetchTasks();
    } catch (err: any) {
      const text = extractErrorMessage(err, 'Failed to update task status.');
      setStatusMessage({ type: 'error', text });
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        assignedToId,
        dueDate: dueDate || null,
      });
      setIsAssignModalOpen(false);
      setTitle('');
      setDescription('');
      setStatusMessage({ type: 'success', text: 'New task assigned successfully!' });
      fetchTasks();
    } catch (err: any) {
      const text = extractErrorMessage(err, 'Failed to assign task.');
      setStatusMessage({ type: 'error', text });
    }
  };

  const handleOpenSubmitModal = (task?: Task) => {
    if (task) {
      setSubmitTaskId(task.id);
    } else {
      const activeTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS');
      setSubmitTaskId(activeTasks.length > 0 ? activeTasks[0].id : '');
    }
    setSubmissionDetails('');
    setSubmissionLinks('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTaskId) return;
    setSubmittingWork(true);
    setStatusMessage(null);

    try {
      const res = await api.patch(`/tasks/${submitTaskId}/status`, {
        status: 'SUBMITTED',
        submissionDetails,
        submissionLinks,
      });

      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Work submitted successfully and sent for Admin review!',
        });
        setIsSubmitModalOpen(false);
        setSubmitTaskId('');
        setSubmissionDetails('');
        setSubmissionLinks('');
        fetchTasks();
      }
    } catch (err: any) {
      const text = extractErrorMessage(err, 'Failed to submit task work.');
      setStatusMessage({ type: 'error', text });
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;
    try {
      await api.post(`/tasks/${selectedTask.id}/comments`, { content: commentText });
      setCommentText('');
      fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to remove this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to remove task.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const canAssignTask = user?.role === 'ADMIN' || user?.role === 'MARKETING_HEAD' || user?.role === 'FOUNDER';
  const submittedTasksCount = tasks.filter((t) => t.status === 'SUBMITTED').length;
  const myActiveTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Task Management & Review</h1>
          <p className="text-xs text-slate-500">Track tasks, submit completed work with links, and review submissions</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Submit Work Button for Employees & Co-Interns */}
          {!canAssignTask && (
            <Button
              onClick={() => handleOpenSubmitModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-0 shadow-xs"
            >
              <Send className="w-4 h-4 mr-1.5" /> Submit Work / Send for Review
            </Button>
          )}

          {/* Assign Task Button for Admin */}
          {canAssignTask && (
            <Button onClick={() => setIsAssignModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Assign New Task
            </Button>
          )}
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'] as const).map((tab) => {
          const count = tab === 'ALL' ? tasks.length : tasks.filter((t) => t.status === tab).length;
          const isSubmittedTab = tab === 'SUBMITTED';

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                filter === tab
                  ? isSubmittedTab
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : isSubmittedTab && count > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold hover:bg-amber-100'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>
                {tab === 'SUBMITTED' ? 'Submitted (Under Review)' : tab.replace('_', ' ')}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === tab
                    ? 'bg-white/20 text-white'
                    : isSubmittedTab && count > 0
                    ? 'bg-amber-200 text-amber-900 font-bold'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task List Cards */}
      {filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No tasks found</p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'ALL'
              ? 'No tasks assigned yet.'
              : filter === 'SUBMITTED'
              ? 'No submitted tasks currently waiting for review.'
              : `No tasks matching status "${filter.replace('_', ' ')}".`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isSubmitted = task.status === 'SUBMITTED';
            // Find latest submission comment if present
            const submissionComment = task.comments
              ?.slice()
              .reverse()
              .find((c) => c.content.includes('📌 WORK SUBMISSION FOR REVIEW:'));

            return (
              <Card
                key={task.id}
                onClick={() => setDetailTask(task)}
                className={`flex flex-col justify-between transition-all cursor-pointer hover:shadow-md hover:border-blue-300 group ${
                  isSubmitted ? 'border-2 border-amber-400 bg-amber-50/10' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.priority === 'URGENT' || task.priority === 'HIGH'
                            ? 'danger'
                            : task.priority === 'MEDIUM'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {task.priority} Priority
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'COMPLETED'
                            ? 'success'
                            : task.status === 'SUBMITTED'
                            ? 'warning'
                            : task.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {task.status === 'SUBMITTED' ? 'SUBMITTED FOR REVIEW' : task.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Eye className="w-3 h-3" /> Full View
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-2 line-clamp-3 leading-relaxed">{task.description}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailTask(task);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1 hover:underline"
                  >
                    <Eye className="w-3 h-3" /> Click to view full description & details &rarr;
                  </button>

                  {/* Submission Details Box for Submitted Tasks */}
                  {isSubmitted && submissionComment && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        Work Submitted by {submissionComment.author.name}:
                      </div>
                      <div className="text-slate-800 whitespace-pre-wrap font-sans text-xs bg-white p-2.5 rounded-lg border border-amber-200">
                        {submissionComment.content.replace('📌 WORK SUBMISSION FOR REVIEW:\n\n', '')}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>By: {task.assignedBy.name}</span>
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">To:</span>
                        <span className="font-medium text-slate-700">
                          {task.assignedTo.name} {task.assignedTo.designation ? `(${task.assignedTo.designation})` : ''}
                        </span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Comments & Activity ({task.comments?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Admin Review Actions for Submitted Tasks */}
                      {isSubmitted && canAssignTask && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, 'IN_PROGRESS');
                            }}
                            className="bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                          >
                            <Clock className="w-3.5 h-3.5 mr-1" /> Request Revision
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, 'COMPLETED');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Review & Complete
                          </Button>
                        </>
                      )}

                      {/* Employee / Co-Intern Actions */}
                      {!canAssignTask && task.status === 'TODO' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, 'IN_PROGRESS');
                          }}
                        >
                          Start Task
                        </Button>
                      )}

                      {!canAssignTask && (task.status === 'TODO' || task.status === 'IN_PROGRESS') && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSubmitModal(task);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Submit Work
                        </Button>
                      )}

                      {canAssignTask && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Work Modal (Employee & Co-Interns) */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Work & Send for Admin Review"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Task to Submit <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={submitTaskId}
              onChange={(e) => setSubmitTaskId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose Assigned Task --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Work Submission Details / Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={submissionDetails}
              onChange={(e) => setSubmissionDetails(e.target.value)}
              placeholder="Describe what work was completed, key highlights, results, or notes for the admin review..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Related Links & Proofs (GitHub, Google Drive, Figma, Demo URL, etc.)
            </label>
            <textarea
              rows={2}
              value={submissionLinks}
              onChange={(e) => setSubmissionLinks(e.target.value)}
              placeholder="e.g. https://github.com/myrepo or https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submittingWork || !submitTaskId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {submittingWork ? 'Submitting Work...' : 'Submit Task & Send for Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal (Admin) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Employee / Co-Intern Task"
        maxWidth="lg"
      >
        <form onSubmit={handleAssignTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build React Component or Monthly Report"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions for the assigned employee/co-intern..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee / Co-Intern</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Task</Button>
          </div>
        </form>
      </Modal>

      {/* Task Comments & Activity Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task Activity & Comments: ${selectedTask.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="max-h-72 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-xl">
              {selectedTask.comments?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No comments or activity logged yet.</p>
              ) : (
                selectedTask.comments?.map((c) => {
                  const isSubmissionLog = c.content.includes('📌 WORK SUBMISSION FOR REVIEW:');
                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border text-xs ${
                        isSubmissionLog
                          ? 'bg-amber-50 border-amber-200 text-slate-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>{c.author.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {new Date(c.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans">{c.content}</div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or feedback..."
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit">Post</Button>
            </form>
          </div>
        </Modal>
      )}

      {/* Task Full Details Popup Modal */}
      {detailTask && (
        <Modal
          isOpen={!!detailTask}
          onClose={() => setDetailTask(null)}
          title="Task Details"
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Header / Badges / Dates */}
            <div className="border-b border-slate-100 pb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      detailTask.priority === 'URGENT' || detailTask.priority === 'HIGH'
                        ? 'danger'
                        : detailTask.priority === 'MEDIUM'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {detailTask.priority} Priority
                  </Badge>
                  <Badge
                    variant={
                      detailTask.status === 'COMPLETED'
                        ? 'success'
                        : detailTask.status === 'SUBMITTED'
                        ? 'warning'
                        : detailTask.status === 'IN_PROGRESS'
                        ? 'primary'
                        : 'neutral'
                    }
                  >
                    {detailTask.status === 'SUBMITTED' ? 'SUBMITTED FOR REVIEW' : detailTask.status.replace('_', ' ')}
                  </Badge>
                </div>

                {detailTask.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Due Date: <strong>{new Date(detailTask.dueDate).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">{detailTask.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned By: <strong className="text-slate-700">{detailTask.assignedBy?.name || 'System Admin'}</strong></span>
                </div>
                {detailTask.assignedTo && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Assigned To:</span>
                    <strong className="text-slate-700">
                      {detailTask.assignedTo.name} {detailTask.assignedTo.designation ? `(${detailTask.assignedTo.designation})` : ''}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Full Task Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Task Description & Instructions
              </h4>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto shadow-inner">
                {detailTask.description}
              </div>
            </div>

            {/* Submission details if task is SUBMITTED */}
            {detailTask.status === 'SUBMITTED' && (() => {
              const subComment = detailTask.comments
                ?.slice()
                .reverse()
                .find((c) => c.content.includes('📌 WORK SUBMISSION FOR REVIEW:'));
              if (!subComment) return null;
              return (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                    <FileText className="w-4 h-4 text-amber-700" />
                    Work Submission Details (by {subComment.author.name})
                  </div>
                  <div className="text-slate-800 whitespace-pre-wrap font-sans text-xs bg-white p-3 rounded-lg border border-amber-200 leading-relaxed">
                    {subComment.content.replace('📌 WORK SUBMISSION FOR REVIEW:\n\n', '')}
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const taskToView = detailTask;
                  setDetailTask(null);
                  setSelectedTask(taskToView);
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                <span>View Comments & Activity ({detailTask.comments?.length || 0})</span>
              </button>

              <div className="flex items-center gap-2">
                {!canAssignTask && detailTask.status === 'TODO' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const id = detailTask.id;
                      setDetailTask(null);
                      handleStatusChange(id, 'IN_PROGRESS');
                    }}
                  >
                    Start Task
                  </Button>
                )}

                {!canAssignTask && (detailTask.status === 'TODO' || detailTask.status === 'IN_PROGRESS') && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const taskToSubmit = detailTask;
                      setDetailTask(null);
                      handleOpenSubmitModal(taskToSubmit);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Submit Work
                  </Button>
                )}

                {detailTask.status === 'SUBMITTED' && canAssignTask && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        const id = detailTask.id;
                        setDetailTask(null);
                        handleStatusChange(id, 'IN_PROGRESS');
                      }}
                      className="bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" /> Request Revision
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const id = detailTask.id;
                        setDetailTask(null);
                        handleStatusChange(id, 'COMPLETED');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Review & Complete
                    </Button>
                  </>
                )}

                <Button variant="secondary" onClick={() => setDetailTask(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
