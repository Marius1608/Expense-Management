
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const expenseService = {
  getAll: () => api.get('/expenses'),
  create: (expense) => api.post('/expenses', expense),
  update: (id, expense) => api.put(`/expenses/${id}`, expense),
  delete: (id) => api.delete(`/expenses/${id}`),
  getById: (id) => api.get(`/expenses/${id}`)
};

export const reportService = {
  generate: (params) => api.post('/reports/generate', params),
  getMonthlyTrends: () => api.get('/reports/monthly-trends'),
  getCategoryBreakdown: () => api.get('/reports/category-breakdown')
};