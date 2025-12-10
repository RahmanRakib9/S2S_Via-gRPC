import { Request, Response } from 'express';
import * as purchaseService from '../services/purchase.service';

/**
 * Buy a product
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

    const purchase = await purchaseService.buyProduct(
      req.user.userId,
      productId,
      quantity || 1
    );

    res.status(201).json({
      message: 'Product purchased successfully',
      data: purchase,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to purchase product';
    const statusCode = message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Get all purchases for current user
 */
export const getMyPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const purchases = await purchaseService.getUserPurchases(req.user.userId);

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

/**
 * Get purchases for a specific user (for gRPC calls from User Service)
 */
export const getUserPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const purchases = await purchaseService.getUserPurchases(userId);

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

