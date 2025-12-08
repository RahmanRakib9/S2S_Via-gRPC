import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/user.service';

/**
 * Get current user's profile
 */
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await userService.getUserProfile(req.user.userId);

    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve profile';
    const statusCode = message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Create user profile
 */
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profileData = {
      ...req.body,
      userId: req.user.userId,
    };

    const profile = await userService.createUserProfile(profileData);

    res.status(201).json({
      message: 'Profile created successfully',
      data: profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create profile';
    const statusCode = message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await userService.updateUserProfile(req.user.userId, req.body);

    res.status(200).json({
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    const statusCode = message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Delete user profile
 */
export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await userService.deleteUserProfile(req.user.userId);

    res.status(200).json({
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete profile';
    const statusCode = message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Get or create user profile
 */
export const getOrCreateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await userService.getOrCreateUserProfile(req.user.userId);

    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve profile';
    res.status(500).json({ error: message });
  }
};

