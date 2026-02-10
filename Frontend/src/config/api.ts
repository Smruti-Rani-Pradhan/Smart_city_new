const defaultApiBaseUrl = import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000/api';

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || defaultApiBaseUrl,
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
};



export const API_ENDPOINTS = {
  

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  

  INCIDENTS: {
    LIST: '/issues',
    CREATE: '/issues',
    REPORT: '/report',
    GET_BY_ID: (id: string) => `/issues/${id}`,
    UPDATE: (id: string) => `/issues/${id}`,
    DELETE: (id: string) => `/issues/${id}`,
    STATS: '/issues/stats',
  },
  
  

  TICKETS: {
    LIST: '/tickets',
    GET_BY_ID: (id: string) => `/tickets/${id}`,
    UPDATE_STATUS: (id: string) => `/tickets/${id}/status`,
    ASSIGN: (id: string) => `/tickets/${id}/assign`,
    STATS: '/tickets/stats',
  },
  
  

  MESSAGES: {
    LIST: (incidentId: string) => `/incidents/${incidentId}/messages`,
    SEND: (incidentId: string) => `/incidents/${incidentId}/messages`,
  },
  
  

  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  
  

  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    HEATMAP: '/analytics/heatmap',
    TRENDS: '/analytics/trends',
  },
};
