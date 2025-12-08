import { User, RegisterRequest, LoginRequest, AuthResponse, TokenPayload } from '../types/auth.types';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.config';
import * as db from '../config/database';

/**
 * Register a new user
 * @param userData - User registration data
 * @returns Authentication response with tokens
 * @throws Error if email already exists or registration fails
 */
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // Check if email already exists
  const existingUser = await db.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await db.createUser({
    email: userData.email,
    username: userData.username,
    password: hashedPassword,
  });

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 * @param credentials - User login credentials
 * @returns Authentication response with tokens
 * @throws Error if credentials are invalid
 */
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Find user by email
  const user = await db.findUserByEmail(credentials.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(credentials.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User object (without password)
 * @throws Error if user not found
 */
export const getUserById = async (userId: string): Promise<Omit<User, 'password'>> => {
  const user = await db.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Generate new tokens from refresh token
 * @param refreshToken - Refresh token
 * @returns New authentication response with tokens
 * @throws Error if refresh token is invalid
 */
export const refreshTokens = async (refreshToken: string): Promise<AuthResponse> => {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new Error('Invalid or expired refresh token');
  }

  // Verify user still exists
  const user = await db.findUserById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Generate new tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

