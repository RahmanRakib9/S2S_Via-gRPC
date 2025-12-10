import axios from 'axios';
import { tokenUtil } from '../utils/token.util';

const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:3001';

const purchaseApi = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
purchaseApi.interceptors.request.use(
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

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
}

export interface BuyProductRequest {
  productId: string;
  quantity?: number;
}

export interface PurchaseResponse {
  message: string;
  data: Purchase;
}

export interface PurchasesResponse {
  message: string;
  data: Purchase[];
  count: number;
}

/**
 * Purchase service via User Service (gRPC communication)
 * These endpoints demonstrate s2s gRPC communication:
 * User Service → Product Service (via gRPC)
 */
export const purchaseService = {
  /**
   * Buy a product via User Service (gRPC)
   * This endpoint calls Product Service via gRPC
   */
  buyProduct: async (productId: string, quantity: number = 1): Promise<PurchaseResponse> => {
    const response = await purchaseApi.post<PurchaseResponse>('/user/purchases', {
      productId,
      quantity,
    });
    return response.data;
  },

  /**
   * Get my purchases via User Service (gRPC)
   * This endpoint calls Product Service via gRPC
   */
  getMyPurchases: async (): Promise<PurchasesResponse> => {
    const response = await purchaseApi.get<PurchasesResponse>('/user/purchases');
    return response.data;
  },
};

