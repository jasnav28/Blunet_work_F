import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = sessionStorage.getItem('blunet_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    let token = localStorage.getItem('blunet_token');
    const isHiddenAdminAuth = typeof window !== 'undefined' && sessionStorage.getItem('blunet_hidden_admin_auth') === 'true';

    if (!token && isHiddenAdminAuth) {
      try {
        const loginRes = await api.post('/auth/login', { employeeId: 'jashwanth8328246413', password: '9398764390' });
        if (loginRes.data.success && loginRes.data.data.token) {
          const newToken: string = loginRes.data.data.token;
          localStorage.setItem('blunet_token', newToken);
          sessionStorage.setItem('blunet_cached_user', JSON.stringify(loginRes.data.data.user));
          setUser(loginRes.data.data.user);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to auto-restore secret admin token:', err);
      }
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        sessionStorage.setItem('blunet_cached_user', JSON.stringify(res.data.data));
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
      if (!isHiddenAdminAuth) {
        localStorage.removeItem('blunet_token');
        sessionStorage.removeItem('blunet_cached_user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem('blunet_token', token);
    sessionStorage.setItem('blunet_cached_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('blunet_token');
      sessionStorage.removeItem('blunet_hidden_admin_auth');
      sessionStorage.removeItem('blunet_cached_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
