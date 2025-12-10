import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/user.service';
import * as productClient from '../grpc/product.client';

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

/**
 * Get all products (demonstrates s2s communication with Product service)
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const products = await productClient.getAllProducts();

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products,
      count: products.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    res.status(500).json({ error: message });
  }
};

/**
 * Get product by ID (demonstrates s2s communication with Product service)
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const product = await productClient.getProductById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve product';
    res.status(500).json({ error: message });
  }
};

/**
 * Get products by category (demonstrates s2s communication with Product service)
 */
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { category } = req.params;
    const products = await productClient.getProductsByCategory(category);

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: products,
      count: products.length,
      category,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    res.status(500).json({ error: message });
  }
};

/**
 * Buy a product (demonstrates s2s communication with Product service via gRPC)
 */
export const buyProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId, quantity } = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const purchase = await productClient.buyProduct(req.user.userId, productId, quantity || 1);

    if (!purchase) {
      res.status(500).json({ error: 'Failed to purchase product' });
      return;
    }

    res.status(201).json({
      message: 'Product purchased successfully',
      data: purchase,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to purchase product';
    res.status(500).json({ error: message });
  }
};

/**
 * Get my purchases (demonstrates s2s communication with Product service via gRPC)
 */
export const getMyPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const purchases = await productClient.getUserPurchases(req.user.userId);

    res.status(200).json({
      message: 'Purchases retrieved successfully',
      data: purchases,
      count: purchases.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve purchases';
    res.status(500).json({ error: message });
  }
};

