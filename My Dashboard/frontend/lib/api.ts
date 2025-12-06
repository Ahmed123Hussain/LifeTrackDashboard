import axios from 'axios';
import { useAuthStore } from './store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data: Partial<{ name: string; avatar: string; theme: string }>) =>
    apiClient.put('/auth/profile', data),
};

// Upload endpoints
export const uploadAPI = {
  uploadCV: (data: FormData) =>
    apiClient.post('/uploads/cv', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Certification endpoints
export const certAPI = {
  getAll: () => apiClient.get('/certs'),
  getOne: (id: string) => apiClient.get(`/certs/${id}`),
  create: (data: FormData) =>
    apiClient.post('/certs', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: any) => apiClient.put(`/certs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/certs/${id}`),
};

// Degree endpoints
export const degreeAPI = {
  getAll: () => apiClient.get('/degrees'),
  getOne: (id: string) => apiClient.get(`/degrees/${id}`),
  create: (data: any) => {
    if (data instanceof FormData) {
      return apiClient.post('/degrees', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return apiClient.post('/degrees', data);
  },
  update: (id: string, data: any) => {
    if (data instanceof FormData) {
      return apiClient.put(`/degrees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return apiClient.put(`/degrees/${id}`, data);
  },
  delete: (id: string) => apiClient.delete(`/degrees/${id}`),
};

// Todo endpoints
export const todoAPI = {
  getAll: (params?: any) => apiClient.get('/todos', { params }),
  getOne: (id: string) => apiClient.get(`/todos/${id}`),
  create: (data: any) => apiClient.post('/todos', data),
  update: (id: string, data: any) => apiClient.put(`/todos/${id}`, data),
  delete: (id: string) => apiClient.delete(`/todos/${id}`),
};

// Goal endpoints
export const goalAPI = {
  getAll: () => apiClient.get('/goals'),
  getOne: (id: string) => apiClient.get(`/goals/${id}`),
  create: (data: any) => apiClient.post('/goals', data),
  update: (id: string, data: any) => apiClient.put(`/goals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/goals/${id}`),
  getDashboardStats: () => apiClient.get('/goals/dashboard/stats'),
};

export default apiClient;
