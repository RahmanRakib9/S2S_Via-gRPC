import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { PRODUCT_GRPC_URL } from '../config/grpc.config';

// Load proto file from project root (go up 2 levels from backend/user)
const PROTO_PATH = path.join(process.cwd(), '../../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition) as any;

// Get the ProductService client
const ProductService = productProto.product.ProductService as grpc.ServiceClientConstructor;

// Create client instance with proper typing for proto methods
let client: any = null;

/**
 * Initialize gRPC client
 */
export const initializeProductGrpcClient = (): void => {
  if (!client) {
    client = new ProductService(
      PRODUCT_GRPC_URL,
      grpc.credentials.createInsecure()
    );
    console.log(`✅ Product gRPC client connected to ${PRODUCT_GRPC_URL}`);
  }
};

/**
 * Close gRPC client connection
 */
export const closeProductGrpcClient = (): void => {
  if (client) {
    client.close();
    client = null;
    console.log('✅ Product gRPC client closed');
  }
};

/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

/**
 * Purchase interface
 */
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

/**
 * Get product by ID via gRPC
 * @param productId - Product ID
 * @returns Product object or null if not found
 */
export const getProductById = (productId: string): Promise<Product | null> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('Product gRPC client not initialized'));
      return;
    }

    client.getProductById({ productId }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC GetProductById error:', error);
        resolve(null);
        return;
      }

      if (!response.success || !response.product) {
        resolve(null);
        return;
      }

      resolve({
        id: response.product.id,
        name: response.product.name,
        price: response.product.price,
        description: response.product.description || '',
        category: response.product.category || '',
      });
    });
  });
};

/**
 * Get all products via gRPC
 * @returns Array of products
 */
export const getAllProducts = (): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('Product gRPC client not initialized'));
      return;
    }

    client.getAllProducts({}, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC GetAllProducts error:', error);
        resolve([]);
        return;
      }

      if (!response.success || !response.products) {
        resolve([]);
        return;
      }

      resolve(
        response.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description || '',
          category: product.category || '',
        }))
      );
    });
  });
};

/**
 * Get products by category via gRPC
 * @param category - Product category
 * @returns Array of products
 */
export const getProductsByCategory = (category: string): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('Product gRPC client not initialized'));
      return;
    }

    client.getProductsByCategory({ category }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC GetProductsByCategory error:', error);
        resolve([]);
        return;
      }

      if (!response.success || !response.products) {
        resolve([]);
        return;
      }

      resolve(
        response.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description || '',
          category: product.category || '',
        }))
      );
    });
  });
};

/**
 * Purchase interface
 */
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

/**
 * Buy a product via gRPC
 * @param userId - User ID
 * @param productId - Product ID
 * @param quantity - Quantity to purchase (default: 1)
 * @returns Purchase object or null if failed
 */
export const buyProduct = (
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<Purchase | null> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('Product gRPC client not initialized'));
      return;
    }

    client.buyProduct({ userId, productId, quantity }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC BuyProduct error:', error);
        resolve(null);
        return;
      }

      if (!response.success || !response.purchase) {
        resolve(null);
        return;
      }

      resolve({
        id: response.purchase.id,
        userId: response.purchase.userId,
        productId: response.purchase.productId,
        productName: response.purchase.productName,
        price: response.purchase.price,
        quantity: response.purchase.quantity,
        totalAmount: response.purchase.totalAmount,
        purchaseDate: response.purchase.purchaseDate,
      });
    });
  });
};

/**
 * Get user purchases via gRPC
 * @param userId - User ID
 * @returns Array of purchases
 */
export const getUserPurchases = (userId: string): Promise<Purchase[]> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('Product gRPC client not initialized'));
      return;
    }

    client.getUserPurchases({ userId }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC GetUserPurchases error:', error);
        resolve([]);
        return;
      }

      if (!response.success || !response.purchases) {
        resolve([]);
        return;
      }

      resolve(
        response.purchases.map((purchase: any) => ({
          id: purchase.id,
          userId: purchase.userId,
          productId: purchase.productId,
          productName: purchase.productName,
          price: purchase.price,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          purchaseDate: purchase.purchaseDate,
        }))
      );
    });
  });
};


