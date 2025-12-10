import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as productService from '../services/product.service';
import * as purchaseService from '../services/purchase.service';

// Load proto file from project root (go up 2 levels from backend/product)
const PROTO_PATH = path.join(process.cwd(), '../../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition) as any;

// Get the ProductService from the loaded proto
const productServiceProto = productProto.product.ProductService;

/**
 * gRPC server implementation
 */
class ProductServiceImplementation {
  /**
   * Get product by ID
   */
  async getProductById(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { productId } = call.request;

      if (!productId) {
        callback(null, {
          success: false,
          product: null,
          error: 'Product ID is required',
        });
        return;
      }

      const product = await productService.getProductById(productId);

      callback(null, {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description || '',
          category: product.category || '',
        },
        error: '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Product not found';
      callback(null, {
        success: false,
        product: null,
        error: errorMessage,
      });
    }
  }

  /**
   * Get all products
   */
  async getAllProducts(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const products = await productService.getAllProducts();

      callback(null, {
        success: true,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description || '',
          category: product.category || '',
        })),
        error: '',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { category } = call.request;

      if (!category) {
        callback(null, {
          success: false,
          products: [],
          error: 'Category is required',
        });
        return;
      }

      const products = await productService.getProductsByCategory(category);

      callback(null, {
        success: true,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description || '',
          category: product.category || '',
        })),
        error: '',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Buy a product
   */
  async buyProduct(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId, productId, quantity } = call.request;

      if (!userId || !productId) {
        callback(null, {
          success: false,
          purchase: null,
          error: 'User ID and Product ID are required',
        });
        return;
      }

      const purchase = await purchaseService.buyProduct(userId, productId, quantity || 1);

      callback(null, {
        success: true,
        purchase: {
          id: purchase.id,
          userId: purchase.userId,
          productId: purchase.productId,
          productName: purchase.productName,
          price: purchase.price,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          purchaseDate: purchase.purchaseDate.toISOString(),
        },
        error: '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to purchase product';
      callback(null, {
        success: false,
        purchase: null,
        error: errorMessage,
      });
    }
  }

  /**
   * Get user purchases
   */
  async getUserPurchases(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;

      if (!userId) {
        callback(null, {
          success: false,
          purchases: [],
          error: 'User ID is required',
        });
        return;
      }

      const purchases = await purchaseService.getUserPurchases(userId);

      callback(null, {
        success: true,
        purchases: purchases.map((purchase) => ({
          id: purchase.id,
          userId: purchase.userId,
          productId: purchase.productId,
          productName: purchase.productName,
          price: purchase.price,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          purchaseDate: purchase.purchaseDate.toISOString(),
        })),
        error: '',
      });
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

let grpcServer: grpc.Server | null = null;

/**
 * Start gRPC server
 */
export const startGrpcServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      grpcServer = new grpc.Server();

      // Add service implementation
      grpcServer.addService(productServiceProto.service, {
        getProductById: (call: any, callback: any) => {
          new ProductServiceImplementation().getProductById(call, callback);
        },
        getAllProducts: (call: any, callback: any) => {
          new ProductServiceImplementation().getAllProducts(call, callback);
        },
        getProductsByCategory: (call: any, callback: any) => {
          new ProductServiceImplementation().getProductsByCategory(call, callback);
        },
        buyProduct: (call: any, callback: any) => {
          new ProductServiceImplementation().buyProduct(call, callback);
        },
        getUserPurchases: (call: any, callback: any) => {
          new ProductServiceImplementation().getUserPurchases(call, callback);
        },
      });

      const grpcPort = process.env.GRPC_PORT || '50053';
      const address = `0.0.0.0:${grpcPort}`;

      grpcServer.bindAsync(
        address,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            console.error('❌ Failed to start gRPC server:', error);
            reject(error);
            return;
          }

          grpcServer!.start();
          console.log(`✅ gRPC server running on port ${port}`);
          resolve();
        }
      );
    } catch (error) {
      console.error('❌ Error starting gRPC server:', error);
      reject(error);
    }
  });
};

/**
 * Stop gRPC server
 */
export const stopGrpcServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!grpcServer) {
      resolve();
      return;
    }

    grpcServer.tryShutdown((error) => {
      if (error) {
        console.error('❌ Error shutting down gRPC server:', error);
        reject(error);
        return;
      }
      console.log('✅ gRPC server stopped');
      grpcServer = null;
      resolve();
    });
  });
};


