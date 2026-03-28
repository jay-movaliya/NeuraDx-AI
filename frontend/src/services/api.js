import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Scan APIs
export const scanAPI = {
  upload: async (formData) => {
    const response = await api.post('/api/scans/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/api/scans');
    return response.data;
  },
  
  getById: async (scanId) => {
    const response = await api.get(`/api/scans/${scanId}`);
    return response.data;
  },
  
  downloadReport: async (scanId) => {
    const response = await api.get(`/api/scans/${scanId}/report`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NeuraDx_Report_${scanId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },
  
  emailReport: async (scanId, email) => {
    const response = await api.post(`/api/scans/${scanId}/email`, { email });
    return response.data;
  },
};

// Patient APIs
export const patientAPI = {
  getAll: async () => {
    const response = await api.get('/api/patients');
    return response.data;
  },
  
  getById: async (patientId) => {
    const response = await api.get(`/api/patients/${patientId}`);
    return response.data;
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

export default api;
