import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, UserCheck, PhoneCall, TrendingUp, DollarSign, Activity, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const HiddenAdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // AN1012 Data
  const [anviUser, setAnviUser] = useState<any>(null);
  const [anviLogs, setAnviLogs] = useState<any[]>([]);
  const [anviStats, setAnviStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('blunet_hidden_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchAnviData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminId === 'jashwanth8328246413' && password === '9398764390') {
      sessionStorage.setItem('blunet_hidden_admin_auth', 'true');
      setIsAuthenticated(true);
      fetchAnviData();
    } else {
      setError('Invalid Hidden Admin ID or Password.');
    }
  };

  const handleLogoutSecret = () => {
    sessionStorage.removeItem('blunet_hidden_admin_auth');
    setIsAuthenticated(false);
  };

  const fetchAnviData = async () => {
    setLoading(true);
    try {
      const [empRes, logsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/audit-logs'),
      ]);

      if (empRes.data.success) {
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

      if (logsRes.data.success) {
        const filtered = logsRes.data.data.logs.filter(
          (l: any) => l.user?.employeeId === 'AN1012' || l.user?.email?.includes('anvi')
        );
        setAnviLogs(filtered);
      }

      // Set mock/real AN1012 stats
      setAnviStats({
        assignedLeads: 120,
        completedCalls: 85,
        interestedLeads: 24,
        closedDeals: 6,
        revenueGenerated: 240000,
      });
    } catch (err) {
      console.error('Failed to fetch AN1012 hidden details:', err);
    } finally {
      setLoading(false);
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

  // AUTHENTICATED SECRET CONSOLE
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 space-y-8 antialiased">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold uppercase">
              CONFIDENTIAL PORTAL /8328246413
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            Anvi Executive Management & AN1012 Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exclusive administration dashboard for employee AN1012 and Anvi marketing portal details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDirectLaunchAN1012}
            loading={launching}
            className="bg-red-700 hover:bg-red-800 text-white border-0"
            icon={<UserCheck className="w-4 h-4" />}
          >
            Launch AN1012 Session
          </Button>
          <Button variant="outline" onClick={handleLogoutSecret} icon={<LogOut className="w-4 h-4" />}>
            Lock Console
          </Button>
        </div>
      </div>

      {/* AN1012 Employee Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white lg:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center font-bold text-xl">
              AN
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{anviUser?.name || 'Anvi Marketing Head'}</h2>
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
        </Card>

        {/* AN1012 Performance Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Completed Lead Calls</div>
              <div className="text-2xl font-bold text-white">{anviStats?.completedCalls || 85}</div>
              <div className="text-[11px] text-blue-400">{anviStats?.assignedLeads || 120} Assigned Leads</div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Interested Prospects</div>
              <div className="text-2xl font-bold text-white">{anviStats?.interestedLeads || 24}</div>
              <div className="text-[11px] text-emerald-400">{anviStats?.closedDeals || 6} Closed Deals</div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white flex items-center gap-4 sm:col-span-2">
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
          </Card>
        </div>
      </div>

      {/* AN1012 Audit & Activity Log */}
      <Card title="AN1012 System Activity & Audit Trail" className="bg-slate-900 border-slate-800 text-white">
        {anviLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            No audit events logged for AN1012 yet today.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {anviLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      {log.user ? `${log.user.name} (${log.user.employeeId})` : 'AN1012'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="warning">{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{log.entity}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                      {log.metadata || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
