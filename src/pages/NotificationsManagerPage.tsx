import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, User, CheckCircle2, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  role: string;
  designation: string;
}

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  user?: {
    name: string;
    employeeId: string;
    role: string;
  };
}

export const NotificationsManagerPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recipientType, setRecipientType] = useState<'ALL' | 'SINGLE'>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentLogs, setSentLogs] = useState<NotificationLog[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInitialData = async () => {
    try {
      const [empRes, logsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/notifications/all'),
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data || []);
      if (logsRes.data.success) setSentLogs(logsRes.data.data?.notifications || logsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load notification manager data:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter both title and notification message.' });
      return;
    }
    if (recipientType === 'SINGLE' && !selectedUserId) {
      setStatusMessage({ type: 'error', text: 'Please select a recipient employee profile.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const payload = {
        recipientType,
        userId: recipientType === 'SINGLE' ? selectedUserId : undefined,
        title: title.trim(),
        message: message.trim(),
      };

      const res = await api.post('/notifications/send', payload);
      if (res.data.success) {
        setStatusMessage({ type: 'success', text: res.data.message || 'Notification sent successfully!' });
        setTitle('');
        setMessage('');
        setSelectedUserId('');
        fetchInitialData();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to send notification.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Admin Notification Dispatcher
          </div>
          <h1 className="text-2xl font-bold">Broadcast & Direct Notifications</h1>
          <p className="text-blue-100 text-sm mt-0.5">
            Send real-time alerts and bell sound notifications to all employees or specific profiles.
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Form */}
        <div className="lg:col-span-2">
          <Card title="Compose Notification" subtitle="Deliver immediate notifications to employee dashboards">
            <form onSubmit={handleSendNotification} className="space-y-5">
              {/* Recipient Selection Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Target Recipients
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecipientType('ALL')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                      recipientType === 'ALL'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${recipientType === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm">All Employees / Profiles</div>
                      <div className="text-[11px] text-slate-500 font-normal">Broadcast to all active accounts</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientType('SINGLE')}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                      recipientType === 'SINGLE'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${recipientType === 'SINGLE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm">Specific Person</div>
                      <div className="text-[11px] text-slate-500 font-normal">Select an individual employee</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Single Person Selector Dropdown */}
              {recipientType === 'SINGLE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Employee / Person <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId}) — {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notification Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Meeting Reminder or New Announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Notification Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write the detailed notification message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full py-3">
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending Notification...' : recipientType === 'ALL' ? 'Send Broadcast Notification to All' : 'Send Direct Notification'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sent Log / History Sidebar */}
        <div>
          <Card title="Recent Notifications Sent" subtitle="Audit trail of recent employee notifications">
            {sentLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No notifications sent yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {sentLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 line-clamp-1">{log.title}</span>
                      <Badge variant="neutral">
                        {log.user ? log.user.name : 'Broadcast'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{log.message}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
