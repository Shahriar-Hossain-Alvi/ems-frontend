import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const axiosPublic = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const axiosSecure = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the current access token to every protected request.
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ems_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Keep response errors intact so React Query mutations/queries can display
// the backend's actual NestJS message. No console logging here intentionally.
axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('ems_token')) {
      localStorage.removeItem('ems_token');
      window.dispatchEvent(new CustomEvent('ems:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
      return 'Cannot reach the server. Check that the backend is running and the API URL is correct.';
    }

    const { status, data } = error.response;
    const message = data?.message ?? data?.error?.message;
    if (Array.isArray(message)) return message.filter(Boolean).join(' ');
    if (typeof message === 'string' && message.trim()) return message;

    if (status === 409) return 'This request conflicts with an existing record. Please review the information and try again.';
    if (status === 400) return 'Some submitted information is invalid. Please review the form.';
    if (status === 401) return 'Your session is invalid or has expired. Please log in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested record could not be found.';
    if (status >= 500) return 'A server error occurred. Please try again later.';
    return `Request failed with status ${status}.`;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
