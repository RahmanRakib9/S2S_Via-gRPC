import axios, { AxiosError } from 'axios';
import { captureApiError } from '../utils/sentry';
import { tokenUtil } from '../utils/token.util';

const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3001';

const userApi = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
userApi.interceptors.request.use(
  (config) => {
    const token = tokenUtil.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add error interceptor to capture API errors
userApi.interceptors.response.use(
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

export interface UserProfile {
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  message: string;
  data: UserProfile;
}

export interface CreateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bio?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
  };
}

export const userService = {
  getMyProfile: async (): Promise<ProfileResponse> => {
    const response = await userApi.get<ProfileResponse>('/user/profile');
    return response.data;
  },

  getOrCreateProfile: async (): Promise<ProfileResponse> => {
    const response = await userApi.get<ProfileResponse>('/user/profile/get-or-create');
    return response.data;
  },

  createProfile: async (data: CreateProfileRequest): Promise<ProfileResponse> => {
    const response = await userApi.post<ProfileResponse>('/user/profile', data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await userApi.put<ProfileResponse>('/user/profile', data);
    return response.data;
  },

  patchProfile: async (data: Partial<UpdateProfileRequest>): Promise<ProfileResponse> => {
    const response = await userApi.patch<ProfileResponse>('/user/profile', data);
    return response.data;
  },

  deleteProfile: async (): Promise<{ message: string }> => {
    const response = await userApi.delete<{ message: string }>('/user/profile');
    return response.data;
  },
};

