import { Purchase } from '../types/product.types';
import { Purchase as PurchaseModel, IPurchase } from '../models/purchase.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';

/**
 * Convert MongoDB document to Purchase type
 */
const toPurchaseType = (purchase: IPurchase | any): Purchase => {
  const id = purchase._id ? purchase._id.toString() : purchase.id;
  return {
    id,
    userId: purchase.userId,
    productId: purchase.productId,
    productName: purchase.productName,
    price: purchase.price,
    quantity: purchase.quantity,
    totalAmount: purchase.totalAmount,
    purchaseDate: purchase.purchaseDate,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt,
  };
};

/**
 * Buy a product (create a purchase)
 * @param userId - User ID
 * @param productId - Product ID
 * @param quantity - Quantity to purchase (default: 1)
 * @returns Created purchase
 * @throws Error if product not found
 */
export const buyProduct = async (
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<Purchase> => {
  // Validate product exists
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new Error('Product not found');
  }

  // Calculate total amount
  const totalAmount = product.price * quantity;

  // Create purchase
  const purchase = new PurchaseModel({
    userId,
    productId: product._id.toString(),
    productName: product.name,
    price: product.price,
    quantity,
    totalAmount,
    purchaseDate: new Date(),
  });

  const savedPurchase = await purchase.save();
  return toPurchaseType(savedPurchase);
};

/**
 * Get all purchases for a user
 * @param userId - User ID
 * @returns Array of purchases
 */
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  const purchases = await PurchaseModel.find({ userId })
    .lean()
    .sort({ createdAt: -1 });
  return purchases.map(toPurchaseType);
};

/**
 * Get purchase by ID
 * @param purchaseId - Purchase ID
 * @returns Purchase or undefined
 */
export const getPurchaseById = async (purchaseId: string): Promise<Purchase | undefined> => {
  if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
    return undefined;
  }
  const purchase = await PurchaseModel.findById(purchaseId).lean();
  return purchase ? toPurchaseType(purchase) : undefined;
};

