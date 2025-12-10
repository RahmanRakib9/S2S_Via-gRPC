import express, { Express, Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import { setUserContext, clearUserContext } from '../../shared/sentry.config';
import authRoutes from './routes/auth.routes';

const app: Express = express();

// Sentry request handler must be the first middleware
// Note: In Sentry v8+, request/error handlers are automatically set up via expressIntegration
// We just need to ensure Sentry is initialized before this middleware runs

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to set user context for Sentry if available
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    setUserContext({
      userId: (req.user as any).userId || (req.user as any).id,
      email: (req.user as any).email,
      username: (req.user as any).username,
    });
  } else {
    clearUserContext();
  }
  next();
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Auth server is running' });
});

// API routes
app.use('/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Sentry will automatically capture errors via its error handler
// We manually capture in our error middleware below

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Capture error in Sentry
  Sentry.captureException(err);
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;

