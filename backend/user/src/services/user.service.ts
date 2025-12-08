import { UserProfile, CreateProfileRequest, UpdateProfileRequest } from '../types/user.types';
import * as db from '../config/database';

/**
 * Get user profile by userId
 * @param userId - User ID
 * @returns User profile
 * @throws Error if profile not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const profile = await db.findProfileByUserId(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  return profile;
};

/**
 * Create a new user profile
 * @param profileData - Profile data
 * @returns Created profile
 * @throws Error if profile already exists
 */
export const createUserProfile = async (profileData: CreateProfileRequest): Promise<UserProfile> => {
  // Check if profile already exists
  const existingProfile = await db.profileExists(profileData.userId);
  if (existingProfile) {
    throw new Error('User profile already exists');
  }

  // Convert dateOfBirth string to Date if provided
  const profileToCreate: any = { ...profileData };
  if (profileData.dateOfBirth) {
    profileToCreate.dateOfBirth = new Date(profileData.dateOfBirth);
  }

  const profile = await db.createProfile(profileToCreate);
  return profile;
};

/**
 * Update user profile
 * @param userId - User ID
 * @param updateData - Update data
 * @returns Updated profile
 * @throws Error if profile not found
 */
export const updateUserProfile = async (
  userId: string,
  updateData: UpdateProfileRequest
): Promise<UserProfile> => {
  // Check if profile exists
  const existingProfile = await db.findProfileByUserId(userId);
  if (!existingProfile) {
    throw new Error('User profile not found');
  }

  // Convert dateOfBirth string to Date if provided
  const updateDataWithDate: any = { ...updateData };
  if (updateData.dateOfBirth) {
    updateDataWithDate.dateOfBirth = new Date(updateData.dateOfBirth);
  }

  const updatedProfile = await db.updateProfile(userId, updateDataWithDate);
  if (!updatedProfile) {
    throw new Error('Failed to update user profile');
  }

  return updatedProfile;
};

/**
 * Delete user profile
 * @param userId - User ID
 * @throws Error if profile not found
 */
export const deleteUserProfile = async (userId: string): Promise<void> => {
  const deleted = await db.deleteProfile(userId);
  if (!deleted) {
    throw new Error('User profile not found');
  }
};

/**
 * Get or create user profile
 * @param userId - User ID
 * @returns User profile
 */
export const getOrCreateUserProfile = async (userId: string): Promise<UserProfile> => {
  let profile = await db.findProfileByUserId(userId);
  
  if (!profile) {
    // Create a basic profile if it doesn't exist
    profile = await db.createProfile({ userId });
  }
  
  return profile;
};

