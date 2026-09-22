import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, MessageSquare, Clock, UserCheck, Calendar, Trash2 } from 'lucide-react';
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
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State for Task Assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Comment Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');

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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
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
      fetchTasks();
    } catch (err) {
      console.error('Failed to assign task:', err);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Task Management</h1>
          <p className="text-xs text-slate-500">Track task progress, priorities, and assignments</p>
        </div>

        {canAssignTask && (
          <Button onClick={() => setIsAssignModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Assign New Task
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.replace('_', ' ')} ({tab === 'ALL' ? tasks.length : tasks.filter((t) => t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Task List Cards */}
      {filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No tasks found</p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'ALL' ? 'No tasks assigned yet.' : `No tasks matching status "${filter.replace('_', ' ')}".`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="flex flex-col justify-between">
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
                          : task.status === 'IN_PROGRESS'
                          ? 'primary'
                          : 'neutral'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-1">{task.title}</h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
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
                      <span className="font-medium text-slate-700">{task.assignedTo.name}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comments ({task.comments?.length || 0})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {task.status === 'TODO' && (
                      <Button size="sm" onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>
                        Start Task
                      </Button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusChange(task.id, 'COMPLETED')}>
                        Complete Task
                      </Button>
                    )}
                    {canAssignTask && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteTask(task.id)}
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Task Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Employee Task"
        maxWidth="lg"
      >
        <form onSubmit={handleAssignTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Sales Report Analysis"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions for the assigned employee..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assign To</label>
              <select
                required
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Task</Button>
          </div>
        </form>
      </Modal>

      {/* Task Comments Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task Comments: ${selectedTask.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-lg">
              {selectedTask.comments?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No comments yet.</p>
              ) : (
                selectedTask.comments?.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="flex justify-between font-medium text-slate-800 mb-1">
                      <span>{c.author.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Button type="submit">Post</Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
