import axios, { AxiosError } from 'axios';
import { captureApiError } from '../utils/sentry';
import { tokenUtil } from '../utils/token.util';

const PRODUCT_API_URL = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3002';

const productApi = axios.create({
  baseURL: PRODUCT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
productApi.interceptors.request.use(
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
productApi.interceptors.response.use(
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

export const productService = {
  getAllProducts: async (): Promise<ProductsResponse> => {
    const response = await productApi.get<ProductsResponse>('/product');
    return response.data;
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await productApi.get<ProductResponse>(`/product/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category: string): Promise<ProductsResponse> => {
    const response = await productApi.get<ProductsResponse>(`/product/category/${category}`);
    return response.data;
  },
};

