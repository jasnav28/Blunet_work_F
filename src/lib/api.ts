import axios from 'axios';
import { networkMonitor } from './networkMonitor';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000, // 15 seconds production timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to outgoing requests and track start time for latency monitoring
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blunet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  (config as any).metadata = { startTime: Date.now() };
  return config;
});

// Handle responses, report server connectivity to NetworkMonitor, and manage authentication errors
api.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).metadata?.startTime;
    const durationMs = startTime ? Date.now() - startTime : undefined;
    
    // Report successful API call to NetworkMonitor
    networkMonitor.reportApiResult({ success: true, durationMs });
    return response;
  },
  (error) => {
    const startTime = (error.config as any)?.metadata?.startTime;
    const durationMs = startTime ? Date.now() - startTime : undefined;
    const status = error.response?.status;
    const isTimeoutOrNetwork = error.code === 'ECONNABORTED' || error.message?.includes('timeout') || !error.response;

    // Report result to centralized NetworkMonitor
    networkMonitor.reportApiResult({
      success: false,
      status,
      durationMs,
      isTimeoutOrNetworkError: isTimeoutOrNetwork,
    });

    // Handle 401 Unauthorized token invalidation
    if (status === 401) {
      const url = error.config?.url || '';
      const isNonCriticalBackgroundRequest =
        url.includes('/activity/heartbeat') ||
        url.includes('/activity/summary') ||
        url.includes('/notifications');

      if (!isNonCriticalBackgroundRequest) {
        localStorage.removeItem('blunet_token');
        sessionStorage.removeItem('blunet_cached_user');
        const isAnviRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/8328246413');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && !isAnviRoute) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
