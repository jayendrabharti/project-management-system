import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '@/types';

// Token management
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Auth API calls
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);

  if (response.data.success && response.data.data?.token) {
    setToken(response.data.data.token);
  }

  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);

  if (response.data.success && response.data.data?.token) {
    setToken(response.data.data.token);
  }

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return response.data.data!.user;
};

export const logout = (): void => {
  removeToken();
};

const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  setToken,
  getToken,
  removeToken,
};

export default authService;
