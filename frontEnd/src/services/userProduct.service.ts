import axios, { AxiosError } from 'axios';
import { captureApiError } from '../utils/sentry';
import { tokenUtil } from '../utils/token.util';

const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3001';

const userProductApi = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
userProductApi.interceptors.request.use(
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
userProductApi.interceptors.response.use(
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

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface ProductsResponse {
  message: string;
  data: Product[];
  count: number;
  category?: string;
}

export interface ProductResponse {
  message: string;
  data: Product;
}

/**
 * Product service via User Service (gRPC communication)
 * These endpoints demonstrate s2s gRPC communication:
 * User Service → Product Service (via gRPC)
 */
export const userProductService = {
  /**
   * Get all products via User Service (gRPC)
   * This endpoint calls Product Service via gRPC
   */
  getAllProducts: async (): Promise<ProductsResponse> => {
    const response = await userProductApi.get<ProductsResponse>('/user/products');
    return response.data;
  },

  /**
   * Get product by ID via User Service (gRPC)
   * This endpoint calls Product Service via gRPC
   */
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await userProductApi.get<ProductResponse>(`/user/products/${id}`);
    return response.data;
  },

  /**
   * Get products by category via User Service (gRPC)
   * This endpoint calls Product Service via gRPC
   */
  getProductsByCategory: async (category: string): Promise<ProductsResponse> => {
    const response = await userProductApi.get<ProductsResponse>(`/user/products/category/${category}`);
    return response.data;
  },
};

