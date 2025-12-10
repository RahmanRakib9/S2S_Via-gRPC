import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Validation rules
const createProfileValidation = [
  body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name must be less than 50 characters'),
  body('phoneNumber').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('avatar').optional().trim().custom((value) => {
    if (!value) return true; // Allow empty
    return /^https?:\/\/.+/.test(value); // Must be URL if provided
  }).withMessage('Avatar must be a valid URL'),
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name must be less than 50 characters'),
  body('phoneNumber').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('avatar').optional().trim().custom((value) => {
    if (!value) return true; // Allow empty
    return /^https?:\/\/.+/.test(value); // Must be URL if provided
  }).withMessage('Avatar must be a valid URL'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('preferences.theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
  body('preferences.language').optional().trim(),
  body('preferences.notifications').optional().isBoolean().withMessage('Notifications must be a boolean'),
];

/**
 * @route   GET /user/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticateToken, userController.getMyProfile);

/**
 * @route   GET /user/profile/get-or-create
 * @desc    Get or create user profile (creates if doesn't exist)
 * @access  Private
 */
router.get('/profile/get-or-create', authenticateToken, userController.getOrCreateProfile);

/**
 * @route   POST /user/profile
 * @desc    Create user profile
 * @access  Private
 */
router.post('/profile', authenticateToken, createProfileValidation, userController.createProfile);

/**
 * @route   PUT /user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, updateProfileValidation, userController.updateProfile);

/**
 * @route   PATCH /user/profile
 * @desc    Partially update user profile
 * @access  Private
 */
router.patch('/profile', authenticateToken, updateProfileValidation, userController.updateProfile);

/**
 * @route   DELETE /user/profile
 * @desc    Delete user profile
 * @access  Private
 */
router.delete('/profile', authenticateToken, userController.deleteProfile);

/**
 * @route   GET /user/products
 * @desc    Get all products (s2s communication with Product service)
 * @access  Private
 */
router.get('/products', authenticateToken, userController.getProducts);

/**
 * @route   GET /user/products/:id
 * @desc    Get product by ID (s2s communication with Product service)
 * @access  Private
 */
router.get('/products/:id', authenticateToken, userController.getProductById);

/**
 * @route   GET /user/products/category/:category
 * @desc    Get products by category (s2s communication with Product service)
 * @access  Private
 */
router.get('/products/category/:category', authenticateToken, userController.getProductsByCategory);

export default router;

