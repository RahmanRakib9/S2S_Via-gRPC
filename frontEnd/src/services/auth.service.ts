import axios, { AxiosError } from 'axios';
import { captureApiError } from '../utils/sentry';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000';

const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error interceptor to capture API errors
authApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      captureApiError(
        new Error(`API Error: ${error.response.status} ${error.response.statusText}`),
        {
          url: error.config?.url || '',
          method: error.config?.method?.toUpperCase() || 'GET',
          statusCode: error.response.status,
          requestData: error.config?.data,
        }
      );
    } else if (error.request) {
      captureApiError(new Error('Network Error: No response received'), {
        url: error.config?.url || '',
        method: error.config?.method?.toUpperCase() || 'GET',
        requestData: error.config?.data,
      });
    }
    return Promise.reject(error);
  }
);

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface MeResponse {
  message: string;
  data: User;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (token: string): Promise<MeResponse> => {
    const response = await authApi.get<MeResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};

