import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://103.93.132.205:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY || '';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (
      status === 401 &&
      !url.includes('/api/auth/login') &&
      !url.includes('/api/auth/captcha')
    ) {
      localStorage.removeItem('accessToken');
      toast.error('Token kedaluwarsa atau sesi tidak valid. Silakan login kembali.');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;