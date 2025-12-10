import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /purchase
 * @desc    Buy a product
 * @access  Private
 */
router.post('/', authenticateToken, purchaseController.buyProduct);

/**
 * @route   GET /purchase/my-purchases
 * @desc    Get current user's purchases
 * @access  Private
 */
router.get('/my-purchases', authenticateToken, purchaseController.getMyPurchases);

/**
 * @route   GET /purchase/user/:userId
 * @desc    Get purchases for a specific user (for internal/gRPC use)
 * @access  Private
 */
router.get('/user/:userId', authenticateToken, purchaseController.getUserPurchases);

export default router;

