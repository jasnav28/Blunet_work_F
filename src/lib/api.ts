import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 20000, // 20 seconds timeout to accommodate slow 2G/3G networks
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

// Handle responses and emit poor network indicator event on slow network delay or timeouts
api.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration > 3500) {
        window.dispatchEvent(new CustomEvent('blunet-poor-network', { detail: { duration } }));
      }
    }
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || !error.response) {
      window.dispatchEvent(new CustomEvent('blunet-poor-network', { detail: { error: true } }));
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('blunet_token');
      sessionStorage.removeItem('blunet_cached_user');
      const isAnviRoute = window.location.pathname.startsWith('/8328246413');
      if (window.location.pathname !== '/login' && !isAnviRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
