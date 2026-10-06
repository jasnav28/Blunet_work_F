import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckSquare, FolderLock, AlertCircle, PlayCircle, CheckCircle2, User, Eye, Calendar, UserCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Task } from '../types';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [session, setSession] = useState<{ activeFormatted: string; activeSeconds?: number; loginTime: string } | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const fetchData = async () => {
    try {
      const [tasksRes, sessionRes] = await Promise.all([
        api.get('/tasks/my'),
        api.get('/activity/summary'),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (sessionRes.data.success) {
        setSession(sessionRes.data.data);
        if (typeof sessionRes.data.data.activeSeconds === 'number') {
          setLiveSeconds(sessionRes.data.data.activeSeconds);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll session summary every 30s to keep backend sync
    const syncInterval = setInterval(fetchData, 30000);
    return () => clearInterval(syncInterval);
  }, []);

  // Live 1-second timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLiveDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours}h ${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Employee Workspace</span>
          <h1 className="text-2xl font-bold mt-1">Good Day, {user?.name}</h1>
          <p className="text-blue-100 text-sm mt-0.5">
            {user?.designation} • {user?.department?.name || 'BluNet Team'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl text-xs font-medium border border-white/20">
          <Clock className="w-4 h-4 text-blue-200 animate-pulse" />
          <div>
            <div className="text-blue-200 text-[10px] uppercase tracking-wider">Today's Active Time</div>
            <div className="text-base font-bold font-mono">
              {liveSeconds > 0 ? formatLiveDuration(liveSeconds) : (session?.activeFormatted || '0h 0m 00s')}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Tasks</div>
            <div className="text-2xl font-bold text-slate-900">{todoTasks.length}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">In Progress</div>
            <div className="text-2xl font-bold text-slate-900">{inProgressTasks.length}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Completed</div>
            <div className="text-2xl font-bold text-slate-900">{completedTasks.length}</div>
          </div>
        </Card>
      </div>

      {/* Task List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="My Assigned Tasks"
            subtitle="View and update your active work items"
            action={
              <Link to="/tasks" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                View All Tasks →
              </Link>
            }
          >
            {tasks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No tasks assigned yet.</p>
                <p className="text-xs text-slate-400">You are all caught up for today!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setDetailTask(task)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-1 flex-1">
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
                      <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
                        <span>{task.title}</span>
                        <span className="text-[11px] font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 shrink-0">
                          <Eye className="w-3 h-3" /> Full View
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === 'TODO' && (
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
                      {task.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, 'COMPLETED');
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <Card title="Quick Resources">
            <p className="text-xs text-slate-500 mb-4">Access company policies, templates, and documentation.</p>
            <Link to="/resources">
              <Button variant="outline" className="w-full">
                <FolderLock className="w-4 h-4 mr-2 text-blue-600" />
                Open Resource Library
              </Button>
            </Link>
          </Card>

          <Card title="My Profile Info">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono font-medium text-slate-900">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-slate-900">{user?.department?.name || 'General'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Joining Date</span>
                <span className="font-medium text-slate-900">
                  {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Task Details Popup Modal */}
      {detailTask && (
        <Modal
          isOpen={!!detailTask}
          onClose={() => setDetailTask(null)}
          title="Task Details"
          maxWidth="2xl"
        >
          <div className="space-y-5">
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
                        : detailTask.status === 'IN_PROGRESS'
                        ? 'primary'
                        : 'neutral'
                    }
                  >
                    {detailTask.status.replace('_', ' ')}
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
                {detailTask.assignedBy && (
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assigned By: <strong className="text-slate-700">{detailTask.assignedBy.name}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Task Description & Guidelines
              </h4>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto shadow-inner">
                {detailTask.description}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              {detailTask.status === 'TODO' && (
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
              {detailTask.status === 'IN_PROGRESS' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const id = detailTask.id;
                    setDetailTask(null);
                    handleStatusChange(id, 'COMPLETED');
                  }}
                >
                  Mark Complete
                </Button>
              )}
              <Button variant="secondary" onClick={() => setDetailTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
