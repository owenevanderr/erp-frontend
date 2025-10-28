import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://erp-backend-production-3dd4.up.railway.app/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 &&
      !originalRequest?.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
     try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (err: any) {
      // Force consistent error
      const message = err.response?.data?.message || 'Invalid credentials';
      throw new Error(message);
    }
  },
  register: async (name: string, email: string, password: string, role?: string) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getActivities: async () => {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },
  getLowStockItems: async () => {
    const response = await api.get('/dashboard/low-stock');
    return response.data;
  },
};

// Accounting API
export const accountingApi = {
  getTransactions: async () => {
    const response = await api.get('/accounting/transactions');
    return response.data;
  },
  createTransaction: async (data: any) => {
    const response = await api.post('/accounting/transactions', data);
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/accounting/reports');
    return response.data;
  },
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'OWNER';
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'STAFF' | 'OWNER';
}

export interface LoginData {
  email: string;
  password: string;
}
