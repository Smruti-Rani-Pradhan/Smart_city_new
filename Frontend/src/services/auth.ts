import { apiClient, ApiResponse } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  userType: 'citizen' | 'official';
  address?: string;
  pincode?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    userType: 'citizen' | 'official';
  };
}

export interface ForgotPasswordData {
  email?: string;
  phone?: string;
}



export const authService = {
  

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  },

  

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};
