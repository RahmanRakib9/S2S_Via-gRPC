import path from 'path';
import dotenv from 'dotenv';
import process from 'process';
import mongoose from 'mongoose';
import { UserProfile, IUserProfile } from '../models/userProfile.model';
import { UserProfile as UserProfileType } from '../types/user.types';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.development';
const envPath = path.join(process.cwd(), envFile);
dotenv.config({ path: envPath });

// Database configuration
const config = {
  database_url: process.env.MONGODB_URI || 'mongodb://localhost:27017/user',
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
 * Convert MongoDB document to UserProfile type
 */
const toUserProfileType = (profile: IUserProfile | any): UserProfileType => {
  const id = profile._id ? profile._id.toString() : profile.id;
  return {
    id,
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber,
    dateOfBirth: profile.dateOfBirth,
    address: profile.address,
    bio: profile.bio,
    avatar: profile.avatar,
    preferences: profile.preferences,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

/**
 * Find user profile by userId
 * @param userId - User ID
 * @returns UserProfile or undefined
 */
export const findProfileByUserId = async (userId: string): Promise<UserProfileType | undefined> => {
  const profile = await UserProfile.findOne({ userId }).lean();
  return profile ? toUserProfileType(profile) : undefined;
};

/**
 * Find user profile by ID
 * @param id - Profile ID
 * @returns UserProfile or undefined
 */
export const findProfileById = async (id: string): Promise<UserProfileType | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }
  const profile = await UserProfile.findById(id).lean();
  return profile ? toUserProfileType(profile) : undefined;
};

/**
 * Create a new user profile
 * @param profileData - Profile data
 * @returns Created profile
 */
export const createProfile = async (
  profileData: Omit<UserProfileType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserProfileType> => {
  const profile = new UserProfile(profileData);
  const savedProfile = await profile.save();
  return toUserProfileType(savedProfile);
};

/**
 * Update user profile
 * @param userId - User ID
 * @param updateData - Update data
 * @returns Updated profile or undefined
 */
export const updateProfile = async (
  userId: string,
  updateData: Partial<Omit<UserProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfileType | undefined> => {
  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();
  return profile ? toUserProfileType(profile) : undefined;
};

/**
 * Delete user profile
 * @param userId - User ID
 * @returns True if deleted, false otherwise
 */
export const deleteProfile = async (userId: string): Promise<boolean> => {
  const result = await UserProfile.deleteOne({ userId });
  return result.deletedCount > 0;
};

/**
 * Check if profile exists for userId
 * @param userId - User ID
 * @returns True if profile exists, false otherwise
 */
export const profileExists = async (userId: string): Promise<boolean> => {
  const profile = await UserProfile.findOne({ userId });
  return !!profile;
};

