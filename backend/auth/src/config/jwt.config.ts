import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

// Load environment variables based on NODE_ENV (same as database config)
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.development';
const envPath = path.join(process.cwd(), '../../', envFile);
dotenv.config({ path: envPath });

// Also try loading from current directory (backend/auth) if project root doesn't exist
const localEnvPath = path.join(process.cwd(), envFile);
dotenv.config({ path: localEnvPath, override: false }); // Don't override if already loaded

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Log the JWT_SECRET being used (first 10 chars for security)
console.log(`🔑 JWT_SECRET loaded: ${JWT_SECRET.substring(0, 10)}... (length: ${JWT_SECRET.length})`);

/**
 * Generate access token
 * @param payload - Token payload containing user information
 * @returns JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 * @param payload - Token payload containing user information
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verify access token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export { JWT_SECRET, JWT_REFRESH_SECRET };

