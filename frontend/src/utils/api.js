import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';


const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Test connection on startup
apiClient.get('/health')
  .then((response) => {
    console.log('✅ Backend connected successfully');
    console.log(`🤖 ML Enabled: ${response.data.ml_enabled}`);
  })
  .catch(() => console.error('❌ Backend connection failed - Make sure backend is running on port 3000'));

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const data = JSON.parse(raw);
        const token = data?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token attached to request');
        }
      }
    } catch (error) {
      console.error('❌ Token parse error:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.code
    });
    
    if (error?.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication
export const login = async (payload) => {
  try {
    console.log('🔐 Login attempt:', payload);
    const { data } = await apiClient.post('/auth/login', payload);
    console.log('✅ Login successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};

export const register = async ({ name, email, password, role = 'user' }) => {
  const { data } = await apiClient.post('/auth/register', { name, email, password, role });
  return data;
};

// Session Management
export const createSession = async (userId = null) => {
  const { data } = await apiClient.post('/session/create', { userId });
  return data;
};

export const getSessionMessages = async (sessionId) => {
  const { data } = await apiClient.get(`/session/messages/${sessionId}`);
  return data;
};

// Chat Functions
export const sendMessage = async ({ sessionId, messageText, userId = null }) => {
  const { data } = await apiClient.post('/chat/message', { sessionId, messageText, userId });
  return data;
};

export const analyzeQuery = async (query) => {
  const { data } = await apiClient.post('/chat/analyze', { query });
  return data;
};

export const getUserFaqs = async () => {
  const { data } = await apiClient.get('/chat/faqs-for-user');
  return data;
};

// Admin Functions
export const getAdminLogs = async () => {
  const { data } = await apiClient.get('/admin/logs');
  return data;
};

export const refreshAnalytics = async () => {
  const { data } = await apiClient.get('/admin/logs/refresh');
  return data;
};

export const downloadLogs = async () => {
  const { data } = await apiClient.get('/admin/logs/download', { responseType: 'blob' });
  return new Blob([data], { type: 'text/csv;charset=utf-8;' });
};

export const getAdminFaqs = async () => {
  const { data } = await apiClient.get('/admin/faq');
  return data;
};

export const createFaq = async ({ question, answer }) => {
  const { data } = await apiClient.post('/admin/faq', { question, answer });
  return data;
};

export const deleteFaq = async (id) => {
  const { data } = await apiClient.delete(`/admin/faq/${id}`);
  return data;
};

export default {
  login,
  register,
  createSession,
  getSessionMessages,
  sendMessage,
  analyzeQuery,
  getUserFaqs,
  getAdminLogs,
  refreshAnalytics,
  downloadLogs,
  getAdminFaqs,
  createFaq,
  deleteFaq,
};
