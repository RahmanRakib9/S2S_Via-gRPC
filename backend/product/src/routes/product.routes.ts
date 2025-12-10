import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /product
 * @desc    Get all products
 * @access  Private
 */
router.get('/', authenticateToken, productController.getAllProducts);

/**
 * @route   GET /product/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, productController.getProductById);

/**
 * @route   GET /product/category/:category
 * @desc    Get products by category
 * @access  Private
 */
router.get('/category/:category', authenticateToken, productController.getProductsByCategory);

export default router;


