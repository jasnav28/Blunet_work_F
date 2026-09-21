import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckSquare, FolderLock, AlertCircle, PlayCircle, CheckCircle2, User } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Task } from '../types';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [session, setSession] = useState<{ activeFormatted: string; loginTime: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tasksRes, sessionRes] = await Promise.all([
        api.get('/tasks/my'),
        api.get('/activity/summary'),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (sessionRes.data.success) setSession(sessionRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          <Clock className="w-4 h-4 text-blue-200" />
          <div>
            <div className="text-blue-200 text-[10px] uppercase tracking-wider">Today's Active Time</div>
            <div className="text-base font-bold">{session?.activeFormatted || 'Calculating...'}</div>
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
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
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
                      <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === 'TODO' && (
                        <Button size="sm" onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>
                          Start Task
                        </Button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <Button size="sm" variant="secondary" onClick={() => handleStatusChange(task.id, 'COMPLETED')}>
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
    </div>
  );
};
