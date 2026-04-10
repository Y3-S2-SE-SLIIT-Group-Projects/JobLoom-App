import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token and low-data-mode header on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const lowData = localStorage.getItem('jobloom_low_data_mode') === 'true';
  if (lowData) {
    config.headers['X-Low-Data'] = '1';
  }

  return config;
});

// Normalize error shape so callers always get a readable message
api.interceptors.response.use(
  response => response,
  error => {
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('OFFLINE'));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
