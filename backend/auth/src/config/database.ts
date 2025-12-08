import path from 'path';
import dotenv from 'dotenv';
import process from 'process';
import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { User as UserType } from '../types/auth.types';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.development';
const envPath = path.join(process.cwd(), envFile);
dotenv.config({ path: envPath });

// Database configuration
const config = {
  database_url: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth',
  env: process.env.NODE_ENV || 'development',
};

export default config;

const MONGODB_URI = config.database_url;

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

/**
 * Convert MongoDB document to User type
 */
const toUserType = (user: IUser | any): UserType => {
  const id = user._id ? user._id.toString() : user.id;
  return {
    id,
    email: user.email,
    username: user.username,
    password: user.password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Find user by email
 * @param email - User email
 * @returns User or undefined
 */
export const findUserByEmail = async (email: string): Promise<UserType | undefined> => {
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  return user ? toUserType(user) : undefined;
};

/**
 * Find user by ID
 * @param id - User ID
 * @returns User or undefined
 */
export const findUserById = async (id: string): Promise<UserType | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }
  const user = await User.findById(id).lean();
  return user ? toUserType(user) : undefined;
};

/**
 * Create a new user
 * @param userData - User data
 * @returns Created user
 */
export const createUser = async (
  userData: Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserType> => {
  const user = new User({
    email: userData.email.toLowerCase(),
    username: userData.username,
    password: userData.password,
  });
  const savedUser = await user.save();
  return toUserType(savedUser);
};

/**
 * Check if email already exists
 * @param email - Email to check
 * @returns True if email exists, false otherwise
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  return !!user;
};
