import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../grpc/client';
import { TokenPayload } from '../types/product.types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens via gRPC
 * Extracts token from Authorization header and verifies it through auth service
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const payload = await validateToken(token);

    if (!payload) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('gRPC authentication error:', error);
    res.status(503).json({ error: 'Authentication service unavailable' });
  }
};


