import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { AUTH_GRPC_URL } from '../config/grpc.config';
import { TokenPayload } from '../types/user.types';

// Load proto file from project root (go up 2 levels from backend/user)
const PROTO_PATH = path.join(process.cwd(), '../../proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

// Get the AuthService client
const AuthService = authProto.auth.AuthService as grpc.ServiceClientConstructor;

// Create client instance with proper typing for proto methods
let client: any = null;

/**
 * Initialize gRPC client
 */
export const initializeGrpcClient = (): void => {
  if (!client) {
    client = new AuthService(
      AUTH_GRPC_URL,
      grpc.credentials.createInsecure()
    );
    console.log(`✅ gRPC client connected to ${AUTH_GRPC_URL}`);
  }
};

/**
 * Close gRPC client connection
 */
export const closeGrpcClient = (): void => {
  if (client) {
    client.close();
    client = null;
    console.log('✅ gRPC client closed');
  }
};

/**
 * Validate JWT token via gRPC
 * @param token - JWT token to validate
 * @returns TokenPayload if valid, null otherwise
 */
export const validateToken = (token: string): Promise<TokenPayload | null> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('gRPC client not initialized'));
      return;
    }

    client.validateToken({ token }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC ValidateToken error:', error);
        resolve(null);
        return;
      }

      if (!response.valid) {
        resolve(null);
        return;
      }

      resolve({
        userId: response.userId,
        email: response.email,
        username: response.username,
      });
    });
  });
};

/**
 * Get user by ID via gRPC
 * @param userId - User ID
 * @returns User object or null if not found
 */
export const getUserById = (userId: string): Promise<{ id: string; email: string; username: string } | null> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('gRPC client not initialized'));
      return;
    }

    client.getUserById({ userId }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC GetUserById error:', error);
        resolve(null);
        return;
      }

      if (!response.success) {
        resolve(null);
        return;
      }

      resolve({
        id: response.id,
        email: response.email,
        username: response.username,
      });
    });
  });
};

/**
 * Verify if user exists via gRPC
 * @param userId - User ID
 * @returns True if user exists, false otherwise
 */
export const verifyUserExists = (userId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error('gRPC client not initialized'));
      return;
    }

    client.verifyUserExists({ userId }, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        console.error('gRPC VerifyUserExists error:', error);
        resolve(false);
        return;
      }

      resolve(response.exists);
    });
  });
};

