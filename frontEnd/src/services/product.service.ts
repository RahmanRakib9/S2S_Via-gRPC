import axios from 'axios';
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

