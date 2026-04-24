import axios from 'axios';

const tokenKeys = ['iv_token', 'iv_admin_token', 'iv_student_token'];

function getStoredToken() {
  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  login: (payload) => api.post('/auth/admin-login', payload),
  adminLogin: (payload) => api.post('/auth/admin-login', payload),
  studentLogin: (payload) => api.post('/auth/student-login', payload),
};

export const visitApi = {
  getAll: (params) => api.get('/visits', { params }),
  getStudent: (params) => api.get('/visits/student', { params }),
  getOne: (id) => api.get(`/visits/${id}`),
  create: (formData) => api.post('/visits', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/visits/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/visits/${id}`),
  analytics: () => api.get('/visits/analytics/overview'),
  deleteImage: (id, imageUrl) => api.delete(`/visits/${id}/images`, { data: { imageUrl } }),
};

export const feedbackApi = {
  create: (payload) => api.post('/feedback', payload),
  byVisit: (visitId) => api.get(`/feedback/${visitId}`),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export default api;
