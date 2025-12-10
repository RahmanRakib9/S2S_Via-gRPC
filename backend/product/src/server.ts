import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { startGrpcServer, stopGrpcServer } from './grpc/server';
import { initializeGrpcClient, closeGrpcClient } from './grpc/client';

const PORT = process.env.PORT || 3002;

// Start server function
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB before starting server
    await connectDatabase();

    // Initialize gRPC client to Auth service
    initializeGrpcClient();

    // Start gRPC server
    await startGrpcServer();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Product server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} signal received: closing servers`);
      server.close(async () => {
        console.log('HTTP server closed');
        await stopGrpcServer();
        closeGrpcClient();
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();


