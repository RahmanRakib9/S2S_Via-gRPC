import { Product } from '../types/product.types';
import * as db from '../config/database';

/**
 * Get product by ID
 * @param productId - Product ID
 * @returns Product
 * @throws Error if product not found
 */
export const getProductById = async (productId: string): Promise<Product> => {
  const product = await db.findProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

/**
 * Get all products
 * @returns Array of products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  return await db.findAllProducts();
};

/**
 * Get products by category
 * @param category - Product category
 * @returns Array of products
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return await db.findProductsByCategory(category);
};


