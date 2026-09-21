import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to outgoing requests if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blunet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth failure responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('blunet_token');
      const isAnviRoute = window.location.pathname.startsWith('/8328246413');
      if (window.location.pathname !== '/login' && !isAnviRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
