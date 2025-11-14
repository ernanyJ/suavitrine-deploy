import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthenticationResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// Create a separate axios instance for auth (without token)
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
    const response = await authApiClient.post<AuthenticationResponse>(
      '/api/v1/auth/login',
      credentials
    );
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthenticationResponse> {
    const response = await authApiClient.post<AuthenticationResponse>(
      '/api/v1/auth/register',
      data
    );
    return response.data;
  },
};

// Auth storage helpers
export const authStorage = {
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
  
  removeToken() {
    localStorage.removeItem('auth_token');
  },
  
  setUser(user: { id: string; name: string; email: string }) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
  
  getUser(): { id: string; name: string; email: string } | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
  
  removeUser() {
    localStorage.removeItem('auth_user');
  },
  
  clear() {
    this.removeToken();
    this.removeUser();
  },
};

