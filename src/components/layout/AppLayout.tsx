import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderLock,
  PhoneCall,
  Users,
  BarChart3,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Building2,
  Clock,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHeartbeat } from '../../hooks/useHeartbeat';
import { Badge } from '../common/Badge';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Activate heartbeat hook
  useHeartbeat();

  const isAnvi = user?.employeeId?.toUpperCase() === 'AN1012';

  React.useEffect(() => {
    if (isAnvi) {
      document.body.classList.add('theme-anvi');
    } else {
      document.body.classList.remove('theme-anvi');
    }
    return () => {
      document.body.classList.remove('theme-anvi');
    };
  }, [isAnvi]);

  if (!user) return <>{children}</>;

  const getNavItems = () => {
    switch (user.role) {
      case 'MARKETING_HEAD':
        return [
          { label: 'Overview', path: '/marketing', icon: BarChart3 },
          { label: 'Lead Caller', path: '/leads', icon: PhoneCall },
          { label: 'Employee Tasks', path: '/tasks', icon: CheckSquare },
          { label: 'Resources', path: '/resources', icon: FolderLock },
        ];
      case 'ADMIN':
        return [
          { label: 'Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'Employees', path: '/employees', icon: Users },
          { label: 'Marketing Team', path: '/marketing-team', icon: UserCog },
          { label: 'Lead Importer', path: '/leads/import', icon: PhoneCall },
          { label: 'Tasks', path: '/tasks', icon: CheckSquare },
          { label: 'Resources', path: '/resources', icon: FolderLock },
          { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        ];
      case 'FOUNDER':
        return [
          { label: 'Executive Dashboard', path: '/founder', icon: Building2 },
          { label: 'Employees', path: '/employees', icon: Users },
          { label: 'Marketing Stats', path: '/marketing', icon: BarChart3 },
          { label: 'Tasks Overview', path: '/tasks', icon: CheckSquare },
          { label: 'Resources', path: '/resources', icon: FolderLock },
        ];
      case 'EMPLOYEE':
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
          { label: 'Company Resources', path: '/resources', icon: FolderLock },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'MARKETING_HEAD':
        return isAnvi ? 'danger' : 'warning';
      case 'FOUNDER':
        return 'primary';
      default:
        return 'info';
    }
  };

  const companyName = isAnvi ? 'Anvi' : 'BluNet';
  const companySub = isAnvi ? 'Workplace' : 'Workplace';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            {isAnvi ? (
              <>
                <div className="h-8 w-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                  A
                </div>
                <div>
                  <span className="font-extrabold text-[#800020] tracking-tight text-lg leading-none block">
                    Anvi
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-[#800020] uppercase block mt-0.5">
                    Workplace
                  </span>
                </div>
              </>
            ) : (
              <>
                <img src="/l.webp" alt="BluNet Logo" className="h-8 w-auto object-contain shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-base">BluNet</span>
                  <span className="block text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
                    Workplace
                  </span>
                </div>
              </>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className={`p-4 mx-3 my-3 rounded-xl border ${isAnvi ? 'bg-rose-50/60 border-rose-200/80' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-medium text-slate-500">{user.employeeId}</span>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {isAnvi ? 'Anvi Mkt Head' : user.role.replace('_', ' ')}
            </Badge>
          </div>
          <div className="font-medium text-sm text-slate-900 truncate">{user.name}</div>
          <div className="text-xs text-slate-500 truncate">{user.designation}</div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            let activeClasses = 'bg-blue-50 text-blue-600 font-semibold';
            let activeIconClasses = 'text-blue-600';
            let inactiveClasses = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
            let inactiveIconClasses = 'text-slate-400';

            if (isAnvi) {
              activeClasses = 'bg-[#800020] text-white font-bold shadow-xs';
              activeIconClasses = 'text-white';
              inactiveClasses = 'text-slate-700 hover:bg-rose-50 hover:text-[#800020]';
              inactiveIconClasses = 'text-[#800020]';
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? activeClasses : inactiveClasses
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? activeIconClasses : inactiveIconClasses}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={`h-16 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs ${isAnvi ? 'border-b-2 border-[#800020]' : 'border-b border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              {isAnvi ? `Anvi — ${navItems.find((n) => n.path === location.pathname)?.label || 'Marketing Workplace'}` : (navItems.find((n) => n.path === location.pathname)?.label || 'BluNet Workplace')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isAnvi ? 'bg-rose-50 text-[#800020] border border-rose-200' : 'bg-slate-100 text-slate-600'}`}>
              <Clock className={`w-3.5 h-3.5 ${isAnvi ? 'text-[#800020]' : 'text-blue-600'}`} />
              <span>{isAnvi ? 'Anvi Portal Active' : 'Active Today'}</span>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isAnvi ? 'bg-[#800020] text-white shadow-xs' : 'bg-blue-100 text-blue-700'}`}>
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.employeeId} • {isAnvi ? 'Anvi' : 'BluNet'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
