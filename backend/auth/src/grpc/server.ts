import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { verifyAccessToken } from '../config/jwt.config';
import * as authService from '../services/auth.service';
import * as db from '../config/database';

// Load proto file from project root (go up 2 levels from backend/auth)
const PROTO_PATH = path.join(process.cwd(), '../../proto/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

// Get the AuthService from the loaded proto
const authServiceProto = authProto.auth.AuthService;

/**
 * gRPC server implementation
 */
class AuthServiceImplementation {
  /**
   * Validate JWT token and return user information
   */
  validateToken(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    try {
      const { token } = call.request;

      if (!token) {
        callback(null, {
          valid: false,
          userId: '',
          email: '',
          username: '',
          error: 'Token is required',
        });
        return;
      }

      const payload = verifyAccessToken(token);

      if (!payload) {
        callback(null, {
          valid: false,
          userId: '',
          email: '',
          username: '',
          error: 'Invalid or expired token',
        });
        return;
      }

      callback(null, {
        valid: true,
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
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
   * Get user information by user ID
   */
  async getUserById(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;

      if (!userId) {
        callback(null, {
          success: false,
          id: '',
          email: '',
          username: '',
          error: 'User ID is required',
        });
        return;
      }

      const user = await authService.getUserById(userId);

      callback(null, {
        success: true,
        id: user.id,
        email: user.email,
        username: user.username,
        error: '',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User not found';
      callback(null, {
        success: false,
        id: '',
        email: '',
        username: '',
        error: errorMessage,
      });
    }
  }

  /**
   * Verify if a user exists by user ID
   */
  async verifyUserExists(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;

      if (!userId) {
        callback(null, {
          exists: false,
          error: 'User ID is required',
        });
        return;
      }

      const user = await db.findUserById(userId);

      callback(null, {
        exists: !!user,
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
      grpcServer.addService(authServiceProto.service, {
        validateToken: (call: any, callback: any) => {
          new AuthServiceImplementation().validateToken(call, callback);
        },
        getUserById: (call: any, callback: any) => {
          new AuthServiceImplementation().getUserById(call, callback);
        },
        verifyUserExists: (call: any, callback: any) => {
          new AuthServiceImplementation().verifyUserExists(call, callback);
        },
      });

      const grpcPort = process.env.GRPC_PORT || '50051';
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

